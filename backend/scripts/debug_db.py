import asyncio
from database import async_session
from sqlalchemy.future import select
import models

async def main():
    async with async_session() as db:
        result = await db.execute(select(models.Parcel.village, models.Parcel.analytics).where(models.Parcel.village.ilike('%Pallapadu%')).limit(1))
        print("Pallapadu:", result.all())
        
        result2 = await db.execute(select(models.Parcel.village, models.Parcel.analytics).where(models.Parcel.village.ilike('%Karempudi%')).limit(1))
        print("Karempudi:", result2.all())

asyncio.run(main())
