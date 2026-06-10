import asyncio
from sqlalchemy import text
from database import SessionLocal

async def run():
    db = SessionLocal()
    res = await db.execute(text("SELECT properties FROM village_boundaries LIMIT 1"))
    print("Village properties:", res.scalar())
        
    await db.close()

asyncio.run(run())
