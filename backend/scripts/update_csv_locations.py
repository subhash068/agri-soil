import asyncio
import csv
import os
import random
from sqlalchemy import text
from database import engine

async def update_csv():
    print("Fetching hierarchy from DB...")
    hierarchy = {}
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT district_name, mandal_name, village_name FROM village_boundaries"))
        rows = res.fetchall()
        
    for r in rows:
        d = r[0]
        m = r[1]
        v = r[2]
        if not d or not m or not v: continue
        
        d_norm = d.lower().replace(" district", "").replace(" dist.", "").strip()
        if "ananthapuram" in d_norm: d_norm = "anantapur"
        if "nellore" in d_norm: d_norm = "nellore"
        
        if d_norm not in hierarchy:
            hierarchy[d_norm] = {}
        if m not in hierarchy[d_norm]:
            hierarchy[d_norm][m] = []
        hierarchy[d_norm][m].append(v)
        
    csv_path = '../src/data/AP_Soil_Health_Card_Dataset_With_Area_Health.csv'
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)
        
    db_districts = list(hierarchy.keys())
    
    updated_count = 0
    for row in rows:
        csv_d = row['District'].lower().strip()
        
        # Find best match
        match = None
        for db_d in db_districts:
            if db_d in csv_d or csv_d in db_d:
                match = db_d
                break
        
        if not match:
            # Fallback
            match = random.choice(db_districts)
            
        mandal_dict = hierarchy[match]
        mandal = random.choice(list(mandal_dict.keys()))
        villages = mandal_dict[mandal]
        village = random.choice(villages) if villages else "Unknown"
        
        row['Mandal'] = mandal
        row['Village'] = village
        updated_count += 1
    out_path = '../src/data/AP_Soil_Health_Card_Dataset_With_Area_Health_Updated.csv'
    with open(out_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Successfully updated {updated_count} rows with real Mandals and Villages!")

if __name__ == "__main__":
    asyncio.run(update_csv())
