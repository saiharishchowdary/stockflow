from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.dashboard import DashboardStats, RevenuePoint, TopProduct
from services import dashboard_service

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await dashboard_service.get_stats(db)


@router.get("/revenue-chart", response_model=list[RevenuePoint])
async def revenue_chart(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await dashboard_service.get_revenue_chart(db)


@router.get("/top-products", response_model=list[TopProduct])
async def top_products(
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await dashboard_service.get_top_products(db, limit)
