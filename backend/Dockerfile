FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Entrypoint: migrate → seed if empty → start server
CMD alembic upgrade head && \
    python -c "
import asyncio, os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text, select

DATABASE_URL = os.environ['DATABASE_URL']
engine = create_async_engine(DATABASE_URL)
Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def check():
    async with Session() as db:
        result = await db.execute(text('SELECT COUNT(*) FROM users'))
        count = result.scalar()
        return count

count = asyncio.run(check())
print(f'Found {count} users in database')
if count == 0:
    print('Empty database — running seed...')
    import subprocess
    subprocess.run(['python', 'seed.py'], check=True)
else:
    print('Database already has data — skipping seed')
" && \
    uvicorn main:app --host 0.0.0.0 --port 8000
