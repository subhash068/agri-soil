import asyncio
from sqlalchemy import text
from database import engine

async def check():
    async with engine.begin() as conn:
        res = await conn.execute(text('SELECT DISTINCT village_name FROM village_boundaries LIMIT 10'))
        rows = res.fetchall()
        print([r[0] for r in rows])

if __name__ == '__main__':
    asyncio.run(check())
