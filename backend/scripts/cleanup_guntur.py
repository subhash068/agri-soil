import asyncio
from sqlalchemy import text
from database import engine

async def cleanup():
    async with engine.begin() as conn:
        res1 = await conn.execute(text("DELETE FROM district_boundaries WHERE name != 'Guntur'"))
        res2 = await conn.execute(text("DELETE FROM mandal_boundaries WHERE district_name != 'Guntur'"))
        res3 = await conn.execute(text("DELETE FROM village_boundaries WHERE district_name != 'Guntur'"))
        print(f"Deleted {res1.rowcount} districts, {res2.rowcount} mandals, {res3.rowcount} villages")

if __name__ == '__main__':
    asyncio.run(cleanup())
