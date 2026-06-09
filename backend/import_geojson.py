import asyncio
import json
import os
import uuid
from sqlalchemy import text
from database import engine, Base

def get_prop(props, keys):
    for k in keys:
        if k in props: return props[k]
    return "Unknown"

async def insert_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    print("Tables created.")
    
    async with engine.begin() as conn:
        # Districts
        print("Importing districts...")
        with open('../src/data/ANDHRA PRADESH_NEW_DISTRICTS.geojson', 'r', encoding='utf-8') as f:
            data = json.load(f)
            for feat in data['features']:
                geom_json = json.dumps(feat['geometry'])
                props = json.dumps(feat['properties'])
                name = feat['properties'].get('NAME')
                await conn.execute(
                    text("INSERT INTO district_boundaries (id, name, properties, geometry) VALUES (:id, :name, :props, ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326))"),
                    {"id": str(uuid.uuid4()), "name": name, "props": props, "geom": geom_json}
                )
        print("Districts imported")
        
        # Mandals
        print("Importing mandals...")
        with open('../src/data/ANDHRA PRADESH_SUBDISTRICTS.geojson', 'r', encoding='utf-8') as f:
            data = json.load(f)
            for feat in data['features']:
                geom_json = json.dumps(feat['geometry'])
                props_dict = feat['properties']
                props = json.dumps(props_dict)
                dname = get_prop(props_dict, ['DISTRICT', 'NAME_2', 'dtname', 'District'])
                mname = get_prop(props_dict, ['SUB_DIST', 'NAME_3', 'sdtname', 'Mandal'])
                await conn.execute(
                    text("INSERT INTO mandal_boundaries (id, district_name, mandal_name, properties, geometry) VALUES (:id, :dname, :mname, :props, ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326))"),
                    {"id": str(uuid.uuid4()), "dname": dname, "mname": mname, "props": props, "geom": geom_json}
                )
        print("Mandals imported")
        
        # Villages
        print("Importing villages...")
        with open('../src/data/ANDHRA PRADESH_VILLAGES.geojson', 'r', encoding='utf-8') as f:
            data = json.load(f)
            for feat in data['features']:
                geom_json = json.dumps(feat['geometry'])
                props_dict = feat['properties']
                props = json.dumps(props_dict)
                dname = get_prop(props_dict, ['DISTRICT', 'NAME_2', 'dtname', 'District'])
                mname = get_prop(props_dict, ['SUB_DIST', 'NAME_3', 'sdtname', 'Mandal'])
                vname = get_prop(props_dict, ['NAME', 'NAME_4', 'vname', 'Village'])
                await conn.execute(
                    text("INSERT INTO village_boundaries (id, district_name, mandal_name, village_name, properties, geometry) VALUES (:id, :dname, :mname, :vname, :props, ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326))"),
                    {"id": str(uuid.uuid4()), "dname": dname, "mname": mname, "vname": vname, "props": props, "geom": geom_json}
                )
        print("Villages imported")

if __name__ == "__main__":
    asyncio.run(insert_data())
