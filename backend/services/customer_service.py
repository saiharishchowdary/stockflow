import math
from typing import Optional

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from models.customer import Customer
from models.order import Order
from schemas.customer import CustomerCreate, CustomerUpdate
from utils.exceptions import DuplicateEmailError, NotFoundError


async def _get_by_email(db: AsyncSession, email: str) -> Optional[Customer]:
    result = await db.execute(select(Customer).where(Customer.email == email.lower()))
    return result.scalar_one_or_none()


async def get_customer_by_id(db: AsyncSession, customer_id: int) -> Customer:
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise NotFoundError("Customer")
    return customer


async def get_customers(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    search: str = "",
) -> dict:
    query = select(Customer)

    if search:
        term = f"%{search}%"
        query = query.where(
            or_(Customer.name.ilike(term), Customer.email.ilike(term), Customer.phone.ilike(term))
        )

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar_one()

    offset = (page - 1) * limit
    results = await db.execute(query.order_by(Customer.created_at.desc()).offset(offset).limit(limit))
    items = results.scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": math.ceil(total / limit) if total > 0 else 1,
    }


async def create_customer(db: AsyncSession, data: CustomerCreate) -> Customer:
    existing = await _get_by_email(db, data.email)
    if existing:
        raise DuplicateEmailError(str(data.email))

    customer = Customer(
        name=data.name,
        email=str(data.email).lower().strip(),
        phone=data.phone,
        address=data.address,
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer


async def update_customer(db: AsyncSession, customer_id: int, data: CustomerUpdate) -> Customer:
    customer = await get_customer_by_id(db, customer_id)

    if data.email is not None and str(data.email).lower() != customer.email:
        conflict = await _get_by_email(db, str(data.email))
        if conflict:
            raise DuplicateEmailError(str(data.email))

    update_data = data.model_dump(exclude_unset=True)
    if "email" in update_data:
        update_data["email"] = update_data["email"].lower().strip()

    for field, value in update_data.items():
        setattr(customer, field, value)

    await db.commit()
    await db.refresh(customer)
    return customer


async def delete_customer(db: AsyncSession, customer_id: int) -> None:
    customer = await get_customer_by_id(db, customer_id)
    await db.delete(customer)
    await db.commit()


async def get_customer_orders(
    db: AsyncSession, customer_id: int, page: int = 1, limit: int = 20
) -> dict:
    await get_customer_by_id(db, customer_id)

    query = select(Order).where(Order.customer_id == customer_id)
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
