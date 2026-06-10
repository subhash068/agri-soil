import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def fix_coords():
    engine = create_async_engine('postgresql+asyncpg://postgres:manager@localhost:5432/agrisoil')
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    print("Fixing parcel coordinates to be inside their respective villages...")
    async with async_session() as db:
        # First, we create a temporary mapping between parcel ID and a random point inside its village
        stmt = text("""
            WITH valid_villages AS (
                SELECT 
                    properties->>'vilname11' as vname1,
                    properties->>'vilnam_soi' as vname2,
                    properties->>'village_name' as vname3,
                    properties->>'VILLAGE' as vname4,
                    properties->>'NAME' as vname5,
                    geometry
                FROM village_boundaries
            ),
            matched_parcels AS (
                SELECT 
                    p.id as parcel_id,
                    v.geometry as v_geom
                FROM parcels p
                JOIN valid_villages v ON 
                    p.village ILIKE v.vname1 OR
                    p.village ILIKE v.vname2 OR
                    p.village ILIKE v.vname3 OR
                    p.village ILIKE v.vname4 OR
                    p.village ILIKE v.vname5
            )
            UPDATE parcels p
            SET 
                lat = ST_Y(ST_GeometryN(ST_GeneratePoints(m.v_geom, 1), 1)),
                lng = ST_X(ST_GeometryN(ST_GeneratePoints(m.v_geom, 1), 1))
            FROM matched_parcels m
            WHERE p.id = m.parcel_id
        """)
        await db.execute(stmt)
        await db.commit()
        print("Updated parcel geometries and lat/lng successfully!")

if __name__ == "__main__":
    asyncio.run(fix_coords())
