import asyncio
from sqlalchemy import text
from database import SessionLocal

async def run():
    db = SessionLocal()
    res = await db.execute(text("SELECT count(*) FROM mandal_boundaries WHERE district_name ILIKE :d"), {"d": "%East Godavari%"})
    print("East Godavari mandals:", res.scalar())
    
    res = await db.execute(text("SELECT district_name FROM mandal_boundaries GROUP BY district_name"))
    print("Districts in mandal_boundaries:", [row[0] for row in res.fetchall()])
        
    await db.close()

asyncio.run(run())
