from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.inventory import InventoryAdjust, InventoryLogResponse, InventoryLogListResponse
from schemas.product import ProductResponse
from services import inventory_service, product_service

router = APIRouter()


@router.get("/low-stock", response_model=list[ProductResponse])
async def list_low_stock(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await product_service.get_low_stock_products(db)


@router.post("/adjust", response_model=InventoryLogResponse)
async def adjust_stock(
    data: InventoryAdjust,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await inventory_service.adjust_stock(db, data)


@router.get("", response_model=InventoryLogListResponse)
async def list_inventory_logs(
    product_id: Optional[int] = Query(None),
    change_type: str = Query(""),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await inventory_service.get_inventory_logs(db, page, limit, product_id, change_type)
