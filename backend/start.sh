#!/bin/bash
set -e

echo "=== StockFlow Startup ==="
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."

echo "--- Running Alembic migrations ---"
alembic upgrade head
echo "--- Migrations complete ---"

echo "--- Seeding database if empty ---"
python3 -c "
import asyncio, os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text

DATABASE_URL = os.environ['DATABASE_URL']
engine = create_async_engine(DATABASE_URL, echo=False)
Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def check_and_seed():
    try:
        async with Session() as db:
            result = await db.execute(text('SELECT COUNT(*) FROM users'))
            count = result.scalar()
            print(f'Found {count} users')
            if count == 0:
                print('Seeding database...')
                import subprocess
                subprocess.run(['python3', 'seed.py'], check=True)
                print('Seed complete!')
            else:
                print('Database already has data, skipping seed')
    except Exception as e:
        print(f'Seed check failed: {e}')
    finally:
        await engine.dispose()

asyncio.run(check_and_seed())
"

echo "--- Starting uvicorn ---"
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
