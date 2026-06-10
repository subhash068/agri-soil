import asyncio
from database import SessionLocal
from sqlalchemy.future import select
from sqlalchemy import func, cast, Float
from models import Parcel

async def main():
    db = SessionLocal()
    stmt = select(
        Parcel.district,
        func.avg(Parcel.health).label("soilHealth"),
        func.avg(cast(func.json_extract_path_text(Parcel.analytics, 'pH'), Float)).label("pH"),
        func.avg(cast(func.json_extract_path_text(Parcel.analytics, 'Organic_Carbon'), Float)).label("Organic_Carbon")
    ).group_by(Parcel.district)
    
    result = await db.execute(stmt)
    for row in result.all():
        print(row)
    await db.close()

if __name__ == "__main__":
    asyncio.run(main())
