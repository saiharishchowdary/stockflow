# StockFlow — Inventory & Order Management System

Enterprise-grade full-stack application for warehouse and e-commerce inventory operations.

```
                    ┌─────────────────────────────────────┐
                    │           StockFlow Architecture      │
                    └─────────────────────────────────────┘

   Browser (React)          Backend (FastAPI)         Database (PostgreSQL)
   ┌─────────────┐          ┌──────────────┐          ┌──────────────────┐
   │  React 18   │  HTTP/   │   FastAPI    │  SQLAlchemy  │  PostgreSQL 15  │
   │  React Router│◄────────►│  uvicorn    │◄───────────►│  products       │
   │  React Query│  JSON    │  JWT Auth   │  asyncpg   │  customers      │
   │  Recharts   │          │  Alembic    │            │  orders         │
   │  Lucide     │          │  Pydantic v2│            │  order_items    │
   └─────────────┘          └──────────────┘            │  inventory_logs │
        │                                               │  users          │
        │ Vite dev proxy                                └──────────────────┘
        │ nginx (prod)
        ▼
   ┌─────────────┐
   │  Docker     │
   │  Compose    │
   └─────────────┘
```

## Quick Start

### Using Docker (Recommended)

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your secrets

# 2. Start all services
docker compose up --build

# 3. Access
#   Frontend:  http://localhost:3000
#   API Docs:  http://localhost:8000/api/docs
#   pgAdmin:   docker compose --profile dev up  →  http://localhost:5050
```

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Start PostgreSQL locally, update DATABASE_URL
alembic upgrade head
python seed.py
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# Vite proxy automatically forwards /api to localhost:8000
```

## Default Login

| Email | Password | Role |
|-------|----------|------|
| admin@stockflow.com | admin1234 | Admin |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `stockflow_db` |
| `POSTGRES_USER` | DB username | `stockflow` |
| `POSTGRES_PASSWORD` | DB password | *(required)* |
| `SECRET_KEY` | JWT signing key | *(required, change!)* |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL | `480` |
| `VITE_API_BASE_URL` | Frontend API base URL | `http://localhost:8000` |

## API Overview

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Products | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/{id}`, `POST /api/products/{id}/restock` |
| Customers | `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/{id}`, `GET /api/customers/{id}/orders` |
| Orders | `GET/POST /api/orders`, `GET /api/orders/{id}`, `PATCH /api/orders/{id}/status` |
| Inventory | `GET /api/inventory`, `POST /api/inventory/adjust`, `GET /api/inventory/low-stock` |
| Dashboard | `GET /api/dashboard/stats`, `GET /api/dashboard/revenue-chart`, `GET /api/dashboard/top-products` |

## Business Rules

1. **SKU Uniqueness** — Duplicate SKUs are rejected with a 409 Conflict error
2. **Email Uniqueness** — Customer emails must be unique across the system  
3. **Stock Validation** — Orders are rejected if ANY item has insufficient stock, listing all failures
4. **Atomic Stock Deduction** — Stock decremented for all items in a single transaction
5. **Stock Restoration** — Cancelling an order restores all item quantities and logs the reversal
6. **Low Stock Alerts** — Products flagged when `stock_quantity <= low_stock_threshold`
7. **Order Numbers** — Auto-generated as `ORD-YYYYMMDD-NNNN`
8. **Price Snapshot** — Order items store `unit_price` at time of order creation
9. **Audit Trail** — Every stock change creates an `inventory_log` entry with before/after values

## Deployment

### Railway (Backend + DB)
```bash
# Push to GitHub, connect Railway
# Add PostgreSQL addon → copy DATABASE_URL
# Set env vars: SECRET_KEY, DATABASE_URL
# Deploy command: alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Vercel (Frontend)
```bash
# Import GitHub repo, set Framework to Vite
# Add env var: VITE_API_BASE_URL=https://your-api.railway.app
# Build command: npm run build | Output dir: dist
```

### Supabase (Alternative DB)
```bash
# Create Supabase project → copy connection string
# Replace asyncpg with psycopg2 URL for Alembic migrations
```

## Project Structure

```
HARISH/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── database.py          # SQLAlchemy async engine
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic v2 schemas
│   ├── routers/             # Route handlers (thin layer)
│   ├── services/            # Business logic
│   ├── middleware/          # JWT auth dependency
│   ├── utils/               # Custom exceptions
│   ├── alembic/             # DB migrations
│   └── seed.py              # Realistic seed data
├── frontend/
│   └── src/
│       ├── api/             # Axios API layer
│       ├── context/         # Auth context
│       ├── hooks/           # React Query hooks
│       ├── components/      # UI + domain components
│       └── pages/           # Route pages
├── docker-compose.yml
└── README.md
```
