import math
from datetime import date
from typing import Optional

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from models.order import Order, OrderItem
from models.product import Product
from models.inventory_log import InventoryLog
from schemas.order import OrderCreate
from utils.exceptions import StockInsufficientError, NotFoundError


async def _generate_order_number(db: AsyncSession) -> str:
    """Generate ORD-YYYYMMDD-NNNN based on count of orders today."""
    today = date.today()
    today_str = today.strftime("%Y%m%d")
    count_result = await db.execute(
        select(func.count(Order.id)).where(func.date(Order.created_at) == today)
    )
    count = count_result.scalar_one()
    return f"ORD-{today_str}-{count + 1:04d}"


async def create_order(db: AsyncSession, data: OrderCreate) -> Order:
    """
    1. Validate ALL items have sufficient stock — collect ALL failures before raising.
    2. Deduct stock atomically in a single transaction.
    3. Snapshot unit_price from product.price at time of order.
    4. Create inventory_log entries for each deduction.
    """
    # Step 1: Load all products and validate stock
    failures = []
    product_map: dict[int, Product] = {}

    for item in data.items:
        result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = result.scalar_one_or_none()

        if product is None:
            failures.append({
                "product_id": item.product_id,
                "sku": "UNKNOWN",
                "requested": item.quantity,
                "available": 0,
            })
            continue

        product_map[item.product_id] = product

        if product.stock_quantity < item.quantity:
            failures.append({
                "product_id": product.id,
                "sku": product.sku,
                "requested": item.quantity,
                "available": product.stock_quantity,
            })

    if failures:
        raise StockInsufficientError(failures)

    # Step 2: All stock available — create order atomically
    try:
        order_number = await _generate_order_number(db)
        total_amount = 0.0

        order = Order(
            order_number=order_number,
            customer_id=data.customer_id,
            status="pending",
            notes=data.notes,
            total_amount=0,
        )
        db.add(order)
        await db.flush()  # get order.id without committing

        for item in data.items:
            product = product_map[item.product_id]
            unit_price = float(product.price)
            subtotal = unit_price * item.quantity
            total_amount += subtotal

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price,   # price snapshot
                subtotal=subtotal,
            )
            db.add(order_item)

            qty_before = product.stock_quantity
            product.stock_quantity -= item.quantity
            qty_after = product.stock_quantity

            log = InventoryLog(
                product_id=product.id,
                change_type="sale",
                quantity_before=qty_before,
                quantity_after=qty_after,
                quantity_changed=-item.quantity,
                reference_id=order.id,
                notes=f"Stock deducted for order {order_number}",
            )
            db.add(log)

        order.total_amount = total_amount
        await db.commit()
        await db.refresh(order)
        return order

    except StockInsufficientError:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        raise


async def get_orders(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    status: str = "",
    customer_id: str = "",
) -> dict:
    query = select(Order)

    if status:
        query = query.where(Order.status == status)
    if customer_id:
        query = query.where(Order.customer_id == int(customer_id))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar_one()

    offset = (page - 1) * limit
    results = await db.execute(query.order_by(Order.created_at.desc()).offset(offset).limit(limit))
    items = results.scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": math.ceil(total / limit) if total > 0 else 1,
    }


async def get_order_by_id(db: AsyncSession, order_id: int) -> Order:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundError("Order")
    return order


async def update_order_status(db: AsyncSession, order_id: int, new_status: str) -> Order:
    order = await get_order_by_id(db, order_id)
    old_status = order.status

    # Stock restoration on cancellation
    if new_status == "cancelled" and old_status != "cancelled":
        for item in order.items:
            if item.product_id is None:
                continue
            result = await db.execute(select(Product).where(Product.id == item.product_id))
            product = result.scalar_one_or_none()
            if product:
                qty_before = product.stock_quantity
                product.stock_quantity += item.quantity
                qty_after = product.stock_quantity

                log = InventoryLog(
                    product_id=product.id,
                    change_type="cancellation",
                    quantity_before=qty_before,
                    quantity_after=qty_after,
                    quantity_changed=item.quantity,
                    reference_id=order.id,
                    notes=f"Stock restored — order {order.order_number} cancelled",
                )
                db.add(log)

    order.status = new_status
    await db.commit()
    await db.refresh(order)
    return order
