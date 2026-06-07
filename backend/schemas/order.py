from datetime import datetime
from decimal import Decimal
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, Field, model_validator


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate] = Field(..., min_length=1)
    notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|confirmed|shipped|delivered|cancelled)$")


class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def pull_product_fields(cls, v: Any) -> Any:
        if hasattr(v, "product") and v.product is not None:
            return {
                "id": v.id,
                "product_id": v.product_id,
                "product_name": v.product.name,
                "product_sku": v.product.sku,
                "quantity": v.quantity,
                "unit_price": v.unit_price,
                "subtotal": v.subtotal,
            }
        return v


class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: Optional[int]
    customer_name: Optional[str] = None
    status: str
    total_amount: Decimal
    notes: Optional[str]
    items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def pull_customer_name(cls, v: Any) -> Any:
        if hasattr(v, "customer") and v.customer is not None:
            return {
                "id": v.id,
                "order_number": v.order_number,
                "customer_id": v.customer_id,
                "customer_name": v.customer.name,
                "status": v.status,
                "total_amount": v.total_amount,
                "notes": v.notes,
                "items": list(v.items or []),
                "created_at": v.created_at,
                "updated_at": v.updated_at,
            }
        return v


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    limit: int
    pages: int
