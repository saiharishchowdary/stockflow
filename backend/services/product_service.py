import math
from typing import Optional

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from models.product import Product
from models.inventory_log import InventoryLog
from schemas.product import ProductCreate, ProductUpdate
from utils.exceptions import DuplicateSKUError, NotFoundError


async def _get_by_sku(db: AsyncSession, sku: str) -> Optional[Product]:
    result = await db.execute(select(Product).where(Product.sku == sku.upper()))
    return result.scalar_one_or_none()


async def get_product_by_id(db: AsyncSession, product_id: int) -> Product:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise NotFoundError("Product")
    return product


async def get_products(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    search: str = "",
    category: str = "",
    low_stock: bool = False,
) -> dict:
    query = select(Product)

    if search:
        term = f"%{search}%"
        query = query.where(or_(Product.name.ilike(term), Product.sku.ilike(term)))
    if category:
        query = query.where(Product.category == category)
    if low_stock:
        query = query.where(Product.stock_quantity <= Product.low_stock_threshold)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar_one()

    offset = (page - 1) * limit
    results = await db.execute(query.order_by(Product.created_at.desc()).offset(offset).limit(limit))
    items = results.scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": math.ceil(total / limit) if total > 0 else 1,
    }


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    existing = await _get_by_sku(db, data.sku)
    if existing:
        raise DuplicateSKUError(data.sku)

    product = Product(
        name=data.name,
        sku=data.sku.upper().strip(),
        description=data.description,
        price=data.price,
        stock_quantity=data.stock_quantity,
        low_stock_threshold=data.low_stock_threshold,
        category=data.category,
    )
    db.add(product)
    await db.flush()

    if product.stock_quantity > 0:
        log = InventoryLog(
            product_id=product.id,
            change_type="restock",
            quantity_before=0,
            quantity_after=product.stock_quantity,
            quantity_changed=product.stock_quantity,
            notes="Initial stock on product creation",
        )
        db.add(log)

    await db.commit()
    await db.refresh(product)
    return product


async def update_product(db: AsyncSession, product_id: int, data: ProductUpdate) -> Product:
    product = await get_product_by_id(db, product_id)

    if data.sku is not None and data.sku.upper() != product.sku:
        conflict = await _get_by_sku(db, data.sku)
        if conflict:
            raise DuplicateSKUError(data.sku)

    update_data = data.model_dump(exclude_unset=True)
    if "sku" in update_data:
        update_data["sku"] = update_data["sku"].upper().strip()

    for field, value in update_data.items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product_id: int) -> None:
    product = await get_product_by_id(db, product_id)
    await db.delete(product)
    await db.commit()


async def restock_product(
    db: AsyncSession, product_id: int, quantity: int, notes: Optional[str] = None
) -> Product:
    product = await get_product_by_id(db, product_id)

    qty_before = product.stock_quantity
    product.stock_quantity += quantity
    qty_after = product.stock_quantity

    log = InventoryLog(
        product_id=product.id,
        change_type="restock",
        quantity_before=qty_before,
        quantity_after=qty_after,
        quantity_changed=quantity,
        notes=notes or f"Restocked +{quantity} units",
    )
    db.add(log)
    await db.commit()
    await db.refresh(product)
    return product


async def get_categories(db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(Product.category)
        .where(Product.category.isnot(None))
        .distinct()
        .order_by(Product.category)
    )
    return [row[0] for row in result.all()]


async def get_low_stock_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(
        select(Product)
        .where(Product.stock_quantity <= Product.low_stock_threshold)
        .order_by(Product.stock_quantity.asc())
    )
    return result.scalars().all()
