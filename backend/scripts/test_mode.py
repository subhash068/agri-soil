import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func, text, select
import models
from database import engine

async def main():
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        stmt = select(
            models.Parcel.village,
            func.mode().within_group(func.json_extract_path_text(models.Parcel.analytics, 'Soil_Type')).label("dominant_soil")
        ).group_by(models.Parcel.village).limit(5)
        result = await db.execute(stmt)
        for row in result.all():
            print(row)

asyncio.run(main())
