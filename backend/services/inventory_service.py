import math
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.product import Product
from models.inventory_log import InventoryLog
from schemas.inventory import InventoryAdjust
from utils.exceptions import NotFoundError


async def get_inventory_logs(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    product_id: Optional[int] = None,
    change_type: str = "",
) -> dict:
    query = select(InventoryLog)

    if product_id is not None:
        query = query.where(InventoryLog.product_id == product_id)
    if change_type:
        query = query.where(InventoryLog.change_type == change_type)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar_one()

    offset = (page - 1) * limit
    results = await db.execute(
        query.order_by(InventoryLog.created_at.desc()).offset(offset).limit(limit)
    )
    items = results.scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": math.ceil(total / limit) if total > 0 else 1,
    }


async def adjust_stock(db: AsyncSession, data: InventoryAdjust) -> InventoryLog:
    if data.quantity_changed == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="quantity_changed cannot be zero",
        )

    result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise NotFoundError("Product")

    qty_before = product.stock_quantity
    qty_after = qty_before + data.quantity_changed

    if qty_after < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock cannot go below zero. Current: {qty_before}, change: {data.quantity_changed}",
        )

    product.stock_quantity = qty_after

    log = InventoryLog(
        product_id=product.id,
        change_type="adjustment",
        quantity_before=qty_before,
        quantity_after=qty_after,
        quantity_changed=data.quantity_changed,
        notes=data.notes or "Manual stock adjustment",
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    # Attach product for response serialization
    log.product = product
    return log
