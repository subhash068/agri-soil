import asyncio
from sqlalchemy import text
from database import engine

async def check():
    async with engine.begin() as conn:
        parcels = await conn.scalar(text('SELECT COUNT(*) FROM parcels'))
        dists = await conn.scalar(text('SELECT COUNT(*) FROM district_boundaries'))
        mandals = await conn.scalar(text('SELECT COUNT(*) FROM mandal_boundaries'))
        villages = await conn.scalar(text('SELECT COUNT(*) FROM village_boundaries'))
        print(f"Parcels: {parcels}")
        print(f"Districts: {dists}")
        print(f"Mandals: {mandals}")
        print(f"Villages: {villages}")

if __name__ == '__main__':
    asyncio.run(check())
