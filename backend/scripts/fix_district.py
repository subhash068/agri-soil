import asyncio
from sqlalchemy import text
from database import engine

async def fix_district_boundary():
    async with engine.begin() as conn:
        # Update Guntur district geometry to be the union of its mandals
        query = """
        UPDATE district_boundaries
        SET geometry = (
            SELECT ST_Union(geometry)
            FROM mandal_boundaries
            WHERE district_name = 'Guntur'
        )
        WHERE name = 'Guntur';
        """
        await conn.execute(text(query))
        
        # Also let's check what other district is left (since count was 2)
        res = await conn.execute(text("SELECT name FROM district_boundaries"))
        names = res.scalars().all()
        print(f"Districts left: {names}")
        
        # We only want Guntur, so delete any other
        await conn.execute(text("DELETE FROM district_boundaries WHERE name != 'Guntur'"))
        
        print("Fixed district boundary geometry to match mandals.")

if __name__ == '__main__':
    asyncio.run(fix_district_boundary())
