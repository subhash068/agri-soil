import asyncio
from sqlalchemy import text
from database import engine

async def fix():
    async with engine.begin() as conn:
        res = await conn.execute(text("UPDATE village_boundaries SET village_name = COALESCE(NULLIF(properties->>'vilnam_soi', ''), NULLIF(properties->>'vilname11', ''), 'Unknown') WHERE village_name = 'Unknown'"))
        print(f"Fixed {res.rowcount} rows!")

if __name__ == '__main__':
    asyncio.run(fix())
