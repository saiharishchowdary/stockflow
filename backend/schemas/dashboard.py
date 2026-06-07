from typing import Optional
from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: float
    low_stock_count: int
    pending_orders_count: int


class RevenuePoint(BaseModel):
    date: str
    revenue: float


class TopProduct(BaseModel):
    product_id: int
    name: str
    sku: str
    category: Optional[str]
    total_sold: int
    revenue: float
