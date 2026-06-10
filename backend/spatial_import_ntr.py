import asyncio
import json
import uuid
from sqlalchemy import text
from database import engine

def get_prop(props, keys):
    for k in keys:
        if k in props and props[k] is not None:
            val = str(props[k]).strip()
            if val != '': return val
    return 'Unknown'

async def run():
    async with engine.begin() as conn:
        # 1. Clear mandal_boundaries and village_boundaries for rebuild
        await conn.execute(text("DELETE FROM mandal_boundaries"))
        await conn.execute(text("DELETE FROM village_boundaries"))
        print("Cleared mandal and village tables.")

        # 2. Read and filter mandals
        print("Importing mandals that intersect NTR District...")
        with open('../src/data/ANDHRA PRADESH_SUBDISTRICTS.geojson', 'r', encoding='utf-8') as f:
            data = json.load(f)
            mandals_inserted = 0
            for feat in data['features']:
                geom_json = json.dumps(feat['geometry'])
                props_dict = feat['properties']
                props = json.dumps(props_dict)
                dname = get_prop(props_dict, ['DISTRICT', 'NAME_2', 'dtname', 'District'])
                mname = get_prop(props_dict, ['SUB_DIST', 'NAME_3', 'sdtname', 'Mandal'])
                
                # We check if the overlap fraction with NTR District is > 10%
                intersect_check = await conn.execute(
                    text("""
                        SELECT 
                            ST_Area(ST_Intersection(ST_SetSRID(ST_GeomFromGeoJSON(:m_geom), 4326), (SELECT geometry FROM district_boundaries WHERE name = 'NTR District'))) /
                            ST_Area(ST_SetSRID(ST_GeomFromGeoJSON(:m_geom), 4326))
                    """),
                    {"m_geom": geom_json}
                )
                overlap = intersect_check.scalar() or 0.0
                
                if overlap > 0.1:
                    # Insert this mandal as part of NTR District
                    await conn.execute(
                        text("""
                            INSERT INTO mandal_boundaries (id, district_name, mandal_name, properties, geometry)
                            VALUES (:id, 'NTR District', :mname, :props, ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326))
                        """),
                        {"id": str(uuid.uuid4()), "mname": mname, "props": props, "geom": geom_json}
                    )
                    mandals_inserted += 1
                    print(f"Added Mandal: {mname} (original district: {dname})")
            print(f"Total mandals inserted: {mandals_inserted}")

        # 3. Read and filter villages
        print("\nImporting villages that intersect NTR District...")
        with open('../src/data/ANDHRA PRADESH_VILLAGES.geojson', 'r', encoding='utf-8') as f:
            data = json.load(f)
            villages_inserted = 0
            for feat in data['features']:
                geom_json = json.dumps(feat['geometry'])
                props_dict = feat['properties']
                props = json.dumps(props_dict)
                dname = get_prop(props_dict, ['DISTRICT', 'NAME_2', 'dtname', 'District'])
                mname = get_prop(props_dict, ['SUB_DIST', 'NAME_3', 'sdtname', 'Mandal'])
                vname = get_prop(props_dict, ['NAME', 'NAME_4', 'vname', 'Village', 'vilname11', 'vilnam_soi'])
                
                # Check overlap fraction > 10%
                intersect_check = await conn.execute(
                    text("""
                        SELECT 
                            ST_Area(ST_Intersection(ST_SetSRID(ST_GeomFromGeoJSON(:v_geom), 4326), (SELECT geometry FROM district_boundaries WHERE name = 'NTR District'))) /
                            ST_Area(ST_SetSRID(ST_GeomFromGeoJSON(:v_geom), 4326))
                    """),
                    {"v_geom": geom_json}
                )
                overlap = intersect_check.scalar() or 0.0
                
                if overlap > 0.1:
                    # Find the corrected mandal name in our mandal_boundaries to be consistent
                    # Since some villages might cross boundaries, we assign it to the mandal it overlaps the most with
                    mandal_check = await conn.execute(
                        text("""
                            SELECT mandal_name,
                                   ST_Area(ST_Intersection(ST_SetSRID(ST_GeomFromGeoJSON(:v_geom), 4326), geometry)) as m_overlap
                            FROM mandal_boundaries 
                            WHERE ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON(:v_geom), 4326), geometry)
                            ORDER BY m_overlap DESC
                            LIMIT 1
                        """),
                        {"v_geom": geom_json}
                    )
                    mandal_row = mandal_check.fetchone()
                    assigned_mandal = mandal_row[0] if mandal_row else mname
                    
                    await conn.execute(
                        text("""
                            INSERT INTO village_boundaries (id, district_name, mandal_name, village_name, properties, geometry)
                            VALUES (:id, 'NTR District', :mname, :vname, :props, ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326))
                        """),
                        {"id": str(uuid.uuid4()), "mname": assigned_mandal, "vname": vname, "props": props, "geom": geom_json}
                    )
                    villages_inserted += 1
            print(f"Total villages inserted: {villages_inserted}")

asyncio.run(run())
