from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductRestock
from services import product_service

router = APIRouter()


@router.get("", response_model=list[ProductResponse])
async def list_products(
    search: str = Query(""),
    category: str = Query(""),
    low_stock: bool = Query(False),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await product_service.get_products(db, page, limit, search, category, low_stock)
    return result["items"]


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await product_service.create_product(db, data)


@router.get("/categories", response_model=list[str])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await product_service.get_categories(db)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await product_service.get_product_by_id(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await product_service.update_product(db, product_id, data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    await product_service.delete_product(db, product_id)


@router.post("/{product_id}/restock", response_model=ProductResponse)
async def restock_product(
    product_id: int,
    body: ProductRestock,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await product_service.restock_product(db, product_id, body.quantity, body.notes)
