import asyncio
from database import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT properties FROM village_boundaries LIMIT 1"))
        print([r[0] for r in res.all()])

if __name__ == "__main__":
    asyncio.run(main())
