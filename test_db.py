import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def main():
    engine = create_async_engine('postgresql+asyncpg://postgres:manager@localhost:5432/agrisoil')
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        stmt = text("SELECT id, farmer, crop, district, mandal, village, ST_AsText(geom) as wkt, lat, lng FROM parcels WHERE id = 'AND-GUN-005611'")
        result = await db.execute(stmt)
        print(result.all())

asyncio.run(main())
