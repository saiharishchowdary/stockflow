from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, Field, model_validator


class InventoryAdjust(BaseModel):
    product_id: int
    quantity_changed: int = Field(..., description="Positive to add, negative to remove stock")
    notes: Optional[str] = None


class InventoryLogResponse(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    change_type: str
    quantity_before: int
    quantity_after: int
    quantity_changed: int
    reference_id: Optional[int]
    notes: Optional[str]
    created_at: datetime
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
                "change_type": v.change_type,
                "quantity_before": v.quantity_before,
                "quantity_after": v.quantity_after,
                "quantity_changed": v.quantity_changed,
                "reference_id": v.reference_id,
                "notes": v.notes,
                "created_at": v.created_at,
            }
        return v


class InventoryLogListResponse(BaseModel):
    items: list[InventoryLogResponse]
    total: int
    page: int
    limit: int
    pages: int
