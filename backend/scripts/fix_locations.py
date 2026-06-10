import asyncio
from sqlalchemy import text
from database import engine

async def fix():
    async with engine.begin() as conn:
        query = """
        WITH points AS (
            SELECT (ST_Dump(ST_GeneratePoints(geometry, (SELECT count(*)::int FROM parcels)))).geom AS pt,
                   row_number() OVER () as rn
            FROM district_boundaries WHERE name='Guntur'
        ),
        numbered_parcels AS (
            SELECT id, row_number() OVER () as rn
            FROM parcels
        )
        UPDATE parcels p
        SET lat = ST_Y(pt.pt), lng = ST_X(pt.pt)
        FROM numbered_parcels np
        JOIN points pt ON np.rn = pt.rn
        WHERE p.id = np.id;
        """
        await conn.execute(text(query))
        print("Done")

if __name__ == '__main__':
    asyncio.run(fix())
