from datetime import date, datetime, timedelta

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.order import Order, OrderItem
from models.product import Product
from models.customer import Customer
from schemas.dashboard import DashboardStats, RevenuePoint, TopProduct


async def get_stats(db: AsyncSession) -> DashboardStats:
    total_products = (await db.execute(select(func.count(Product.id)))).scalar_one()
    total_customers = (await db.execute(select(func.count(Customer.id)))).scalar_one()
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar_one()

    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .where(Order.status == "delivered")
    )
    total_revenue = float(revenue_result.scalar_one())

    low_stock_result = await db.execute(
        select(func.count(Product.id)).where(
            Product.stock_quantity <= Product.low_stock_threshold
        )
    )
    low_stock_count = low_stock_result.scalar_one()

    pending_result = await db.execute(
        select(func.count(Order.id)).where(Order.status == "pending")
    )
    pending_orders_count = pending_result.scalar_one()

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=total_revenue,
        low_stock_count=low_stock_count,
        pending_orders_count=pending_orders_count,
    )


async def get_revenue_chart(db: AsyncSession) -> list[RevenuePoint]:
    today = date.today()
    start = today - timedelta(days=6)

    result = await db.execute(
        select(
            func.date(Order.created_at).label("day"),
            func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
        )
        .where(Order.status == "delivered")
        .where(Order.created_at >= datetime.combine(start, datetime.min.time()))
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    )
    rows = {str(row.day): float(row.revenue) for row in result.all()}

    chart = []
    for i in range(7):
        day = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        chart.append(RevenuePoint(date=day, revenue=rows.get(day, 0.0)))

    return chart


async def get_top_products(db: AsyncSession, limit: int = 5) -> list[TopProduct]:
    result = await db.execute(
        select(
            Product.id.label("product_id"),
            Product.name.label("name"),
            Product.sku.label("sku"),
            Product.category.label("category"),
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.subtotal).label("revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status == "delivered")
        .group_by(Product.id, Product.name, Product.sku, Product.category)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
    )
    return [
        TopProduct(
            product_id=row.product_id,
            name=row.name,
            sku=row.sku,
            category=row.category,
            total_sold=int(row.total_sold),
            revenue=float(row.revenue),
        )
        for row in result.all()
    ]
