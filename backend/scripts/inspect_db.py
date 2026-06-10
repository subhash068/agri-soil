import asyncio
from database import SessionLocal
from sqlalchemy.future import select
from models import Parcel

async def main():
    db = SessionLocal()
    result = await db.execute(select(Parcel).limit(1))
    p = result.scalar_one_or_none()
    if p:
        print("Analytics:", p.analytics)
        print("District:", p.district)
    else:
        print("No parcels found.")
    await db.close()

if __name__ == "__main__":
    asyncio.run(main())
