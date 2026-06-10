import asyncio
from sqlalchemy import text
from database import engine

async def get_bounds():
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT ST_Extent(geometry) FROM district_boundaries WHERE name='Guntur'"))
        val = res.scalar()
        print(f"Guntur Bounds: {val}")

if __name__ == '__main__':
    asyncio.run(get_bounds())
