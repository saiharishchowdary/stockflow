"""
seed.py — Populate StockFlow database with realistic demo data.
Run: python seed.py
Idempotent check in Dockerfile: only runs if users table is empty.
"""
import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add backend dir to path so imports work when run from project root
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import text

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://stockflow:stockflow123@localhost:5432/stockflow_db",
)

engine = create_async_engine(DATABASE_URL, echo=False)
Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


PRODUCTS = [
    # Electronics
    {"name": "Sony WH-1000XM5 Headphones", "sku": "ELEC-WH1000-001", "price": 24999.00, "category": "Electronics", "stock_quantity": 18, "low_stock_threshold": 5, "description": "Industry-leading noise cancelling wireless headphones with 30hr battery"},
    {"name": "Samsung 27\" 4K Monitor", "sku": "ELEC-MON27-001", "price": 32999.00, "category": "Electronics", "stock_quantity": 7, "low_stock_threshold": 3, "description": "IPS panel, USB-C 65W charging, 144Hz refresh rate"},
    {"name": "Logitech MX Master 3S Mouse", "sku": "ELEC-MOUSE-001", "price": 8999.00, "category": "Electronics", "stock_quantity": 4, "low_stock_threshold": 8, "description": "Advanced wireless mouse, 8K DPI, near-silent clicks"},
    {"name": "Mechanical Keyboard TKL RGB", "sku": "ELEC-KB-001", "price": 5499.00, "category": "Electronics", "stock_quantity": 12, "low_stock_threshold": 5, "description": "TKL layout, Cherry MX Brown switches, per-key RGB"},
    {"name": "USB-C Hub 10-in-1", "sku": "ELEC-HUB-001", "price": 2999.00, "category": "Electronics", "stock_quantity": 3, "low_stock_threshold": 10, "description": "4K HDMI, 100W PD, 4× USB-A, SD/microSD, ethernet"},
    # Clothing
    {"name": "Levi's 511 Slim Jeans", "sku": "CLTH-JEANS-001", "price": 3499.00, "category": "Clothing", "stock_quantity": 45, "low_stock_threshold": 10, "description": "Classic slim fit, stretch denim, multiple washes"},
    {"name": "Nike Dri-FIT Running Tee", "sku": "CLTH-RNGTEE-001", "price": 1299.00, "category": "Clothing", "stock_quantity": 60, "low_stock_threshold": 15, "description": "Lightweight moisture-wicking fabric, UPF 40+"},
    {"name": "Adidas Ultraboost 22", "sku": "CLTH-SHOES-001", "price": 14999.00, "category": "Clothing", "stock_quantity": 8, "low_stock_threshold": 5, "description": "Responsive BOOST midsole, Primeknit+ upper, neutral"},
    {"name": "Uniqlo HEATTECH Thermal Tee", "sku": "CLTH-THRML-001", "price": 799.00, "category": "Clothing", "stock_quantity": 0, "low_stock_threshold": 20, "description": "Ultra warm innerwear, moisture wicking, 4-way stretch"},
    # Home & Garden
    {"name": "Instant Pot Duo 7-in-1", "sku": "HOME-IPOT-001", "price": 9999.00, "category": "Home & Garden", "stock_quantity": 14, "low_stock_threshold": 5, "description": "6 quart, pressure cooker, slow cooker, rice cooker and more"},
    {"name": "Dyson V11 Vacuum Cleaner", "sku": "HOME-VCUM-001", "price": 43999.00, "category": "Home & Garden", "stock_quantity": 5, "low_stock_threshold": 3, "description": "Cordless, 60min runtime, HEPA filtration, LCD screen"},
    {"name": "IKEA KALLAX Shelf Unit", "sku": "HOME-SHELF-001", "price": 5999.00, "category": "Home & Garden", "stock_quantity": 20, "low_stock_threshold": 5, "description": "4×4 cubby storage unit, white, 147×147 cm"},
    # Sports
    {"name": "Yoga Mat Premium 6mm", "sku": "SPRT-YOGA-001", "price": 1499.00, "category": "Sports", "stock_quantity": 35, "low_stock_threshold": 10, "description": "Non-slip TPE material, alignment lines, carry strap"},
    {"name": "Adjustable Dumbbell Set 20kg", "sku": "SPRT-DUMBL-001", "price": 7999.00, "category": "Sports", "stock_quantity": 6, "low_stock_threshold": 5, "description": "Select weight 2–20kg, replaces 9 pairs of dumbbells"},
    {"name": "Resistance Bands Set (5 levels)", "sku": "SPRT-RBAND-001", "price": 899.00, "category": "Sports", "stock_quantity": 2, "low_stock_threshold": 15, "description": "Natural latex, 5 resistance levels 10–50 lbs, door anchor"},
]

CUSTOMERS = [
    {"name": "Priya Sharma", "email": "priya.sharma@gmail.com", "phone": "+91-9876543210", "address": "Flat 4B, Banjara Hills, Hyderabad 500034"},
    {"name": "Rahul Mehta", "email": "rahul.mehta@outlook.com", "phone": "+91-9823456789", "address": "202 Andheri West, Mumbai 400053"},
    {"name": "Ananya Reddy", "email": "ananya.reddy@gmail.com", "phone": "+91-9741234567", "address": "15 Indiranagar, Bangalore 560038"},
    {"name": "Karan Joshi", "email": "karan.joshi@yahoo.com", "phone": "+91-9654321098", "address": "C-45 Vasant Kunj, New Delhi 110070"},
    {"name": "Meera Nair", "email": "meera.nair@gmail.com", "phone": "+91-9512345678", "address": "12 T Nagar, Chennai 600017"},
    {"name": "Arjun Singh", "email": "arjun.singh@hotmail.com", "phone": "+91-9387654321", "address": "Block 7, Salt Lake, Kolkata 700091"},
    {"name": "Kavya Patel", "email": "kavya.patel@gmail.com", "phone": "+91-9261234567", "address": "Near Law Garden, Ahmedabad 380006"},
    {"name": "Rohan Kumar", "email": "rohan.kumar@gmail.com", "phone": "+91-9134567890", "address": "Aundh, Pune 411007"},
    {"name": "Sneha Iyer", "email": "sneha.iyer@gmail.com", "phone": "+91-9045678901", "address": "Jubilee Hills, Hyderabad 500033"},
    {"name": "Vikram Menon", "email": "vikram.menon@gmail.com", "phone": "+91-8956789012", "address": "Koregaon Park, Pune 411001"},
]


async def seed():
    from models.user import User
    from models.product import Product
    from models.customer import Customer
    from models.order import Order, OrderItem
    from models.inventory_log import InventoryLog
    from services.auth_service import hash_password

    async with Session() as db:
        # ── Admin user ──────────────────────────────────────
        admin = User(
            email="admin@stockflow.com",
            hashed_password=hash_password("admin1234"),
            full_name="Admin User",
            is_admin=True,
            is_active=True,
        )
        db.add(admin)

        # ── Products ────────────────────────────────────────
        products = []
        for p_data in PRODUCTS:
            p = Product(**p_data)
            db.add(p)
            products.append(p)

        await db.flush()

        # Initial inventory logs for products with stock
        for p in products:
            if p.stock_quantity > 0:
                log = InventoryLog(
                    product_id=p.id,
                    change_type="restock",
                    quantity_before=0,
                    quantity_after=p.stock_quantity,
                    quantity_changed=p.stock_quantity,
                    notes="Initial stock — seeded",
                )
                db.add(log)

        # ── Customers ───────────────────────────────────────
        customers = []
        for c_data in CUSTOMERS:
            c = Customer(**c_data)
            db.add(c)
            customers.append(c)

        await db.flush()

        # ── Orders (20 orders in various statuses) ──────────
        def make_order_number(idx: int, days_ago: int) -> str:
            d = (datetime.now() - timedelta(days=days_ago)).strftime("%Y%m%d")
            return f"ORD-{d}-{idx:04d}"

        orders_data = [
            # (customer_idx, [(product_idx, qty)], status, days_ago)
            (0, [(0, 1), (2, 2)],       "delivered",  30),
            (1, [(5, 2), (6, 3)],       "delivered",  27),
            (2, [(9, 1), (12, 1)],      "delivered",  24),
            (3, [(1, 1)],               "delivered",  21),
            (4, [(13, 1), (14, 3)],     "delivered",  18),
            (0, [(3, 1), (4, 2)],       "delivered",  15),
            (1, [(7, 1), (10, 1)],      "delivered",  12),
            (5, [(0, 2), (11, 1)],      "shipped",    9),
            (6, [(6, 5), (12, 2)],      "shipped",    7),
            (7, [(2, 1)],               "shipped",    6),
            (8, [(5, 3), (8, 2)],       "confirmed",  5),
            (9, [(1, 1), (3, 1)],       "confirmed",  4),
            (0, [(4, 3), (13, 1)],      "confirmed",  3),
            (2, [(9, 2)],               "pending",    2),
            (3, [(0, 1), (6, 2)],       "pending",    2),
            (4, [(7, 1), (12, 1)],      "pending",    1),
            (5, [(2, 2), (14, 2)],      "pending",    1),
            (6, [(10, 1)],              "pending",    0),
            (7, [(5, 1), (11, 1)],      "cancelled",  10),
            (8, [(3, 2)],               "cancelled",  8),
        ]

        for idx, (cust_idx, item_data, status, days_ago) in enumerate(orders_data, start=1):
            cust = customers[cust_idx]
            created = datetime.now() - timedelta(days=days_ago)
            order_number = make_order_number(idx, days_ago)

            total = sum(
                float(products[pi].price) * qty
                for pi, qty in item_data
            )

            order = Order(
                order_number=order_number,
                customer_id=cust.id,
                status=status,
                total_amount=total,
                created_at=created,
                updated_at=created,
            )
            db.add(order)
            await db.flush()

            for product_idx, qty in item_data:
                p = products[product_idx]
                unit_price = float(p.price)
                item = OrderItem(
                    order_id=order.id,
                    product_id=p.id,
                    quantity=qty,
                    unit_price=unit_price,
                    subtotal=round(unit_price * qty, 2),
                )
                db.add(item)

                # Inventory log for sale/cancellation
                if status != "cancelled":
                    log = InventoryLog(
                        product_id=p.id,
                        change_type="sale",
                        quantity_before=p.stock_quantity + qty,
                        quantity_after=p.stock_quantity,
                        quantity_changed=-qty,
                        reference_id=order.id,
                        notes=f"Sale — {order_number}",
                        created_at=created,
                    )
                    db.add(log)
                else:
                    log = InventoryLog(
                        product_id=p.id,
                        change_type="cancellation",
                        quantity_before=p.stock_quantity,
                        quantity_after=p.stock_quantity + qty,
                        quantity_changed=qty,
                        reference_id=order.id,
                        notes=f"Cancellation — {order_number}",
                        created_at=created,
                    )
                    db.add(log)

        await db.commit()

    await engine.dispose()
    print("✅ Seed complete!")
    print("   Login: admin@stockflow.com / admin1234")
    print(f"   {len(PRODUCTS)} products | {len(CUSTOMERS)} customers | 20 orders")


if __name__ == "__main__":
    asyncio.run(seed())
