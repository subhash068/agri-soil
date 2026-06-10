import asyncio
import json
import uuid
import os
from sqlalchemy import text
from database import engine, Base

async def import_all_districts():
    async with engine.begin() as conn:
        print("Clearing district boundaries...")
        await conn.execute(text("DELETE FROM district_boundaries"))
        
        print("Importing all districts...")
        with open('C:/Users/windows-11/Downloads/ANDHRA PRADESH_NEW_DISTRICTS.geojson', 'r', encoding='utf-8') as f:
            data = json.load(f)
            for feat in data['features']:
                geom_json = json.dumps(feat['geometry'])
                props = json.dumps(feat['properties'])
                name = feat['properties'].get('NAME')
                await conn.execute(
                    text("INSERT INTO district_boundaries (id, name, properties, geometry) VALUES (:id, :name, :props, ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326))"),
                    {"id": str(uuid.uuid4()), "name": name, "props": props, "geom": geom_json}
                )
        print(f"Imported {len(data['features'])} districts successfully.")

if __name__ == "__main__":
    asyncio.run(import_all_districts())
