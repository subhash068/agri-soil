import asyncio
import csv
import uuid
import random
import json
from sqlalchemy import text
from database import engine

async def import_parcels():
    csv_path = '../src/data/AP_Soil_Health_Card_Dataset_With_Area_Health_Updated.csv'
    
    print("Reading CSV data...")
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    print(f"Loaded {len(rows)} rows. Connecting to database...")
    
    async with engine.begin() as conn:
        print("Clearing existing mock parcels...")
        await conn.execute(text("DELETE FROM parcels"))
        
        insert_query = """
            INSERT INTO parcels (
                id, farmer, village, mandal, district,
                crop, acreage, health, risk, confidence, lat, lng, ndvi, evi, ndre, analytics
            ) VALUES (
                :id, :farmer, :village, :mandal, :district,
                :crop, :acreage, :health, :risk, :confidence, :lat, :lng, :ndvi, :evi, :ndre, :analytics
            )
        """
        
        params_list = []
        for r in rows:
            health_val = float(r['Soil_Healthy_%'])
            if health_val >= 80:
                risk = "Low"
            elif health_val >= 60:
                risk = "Medium"
            else:
                risk = "High"
                
            analytics_data = {
                "pH": float(r['pH']),
                "EC": float(r['EC']),
                "Organic_Carbon": float(r['Organic_Carbon']),
                "Nitrogen": float(r['Nitrogen']),
                "Phosphorus": float(r['Phosphorus']),
                "Potassium": float(r['Potassium']),
                "Zinc": float(r['Zinc']),
                "Iron": float(r['Iron']),
                "Copper": float(r['Copper']),
                "Boron": float(r['Boron']),
                "Soil_Type": r['Soil_Type'],
                "Irrigation_Type": r['Irrigation_Type'],
                "Crop_Season": r['Crop_Season'],
                "Survey_Number": r['Survey_Number']
            }
            
            params_list.append({
                "id": r['Parcel_ID'],
                "farmer": r.get('Farmer_Name', f"FARMER-{r['Parcel_ID'][-6:]}"),
                "village": r['Village'],
                "mandal": r['Mandal'],
                "district": r['District'],
                "crop": r['Crop_Name'],
                "acreage": float(r['Parcel_Area_Acres']),
                "health": health_val,
                "risk": risk,
                "confidence": round(random.uniform(85.0, 99.0), 1),
                "lat": round(random.uniform(15.98, 16.59), 4),
                "lng": round(random.uniform(80.12, 80.80), 4),
                "ndvi": round(random.uniform(0.3, 0.8), 2),
                "evi": round(random.uniform(0.2, 0.6), 2),
                "ndre": round(random.uniform(0.2, 0.5), 2),
                "analytics": json.dumps(analytics_data)
            })
            
        print("Inserting 10,000 rows into PostgreSQL...")
        # Execute in chunks of 1000
        chunk_size = 1000
        for i in range(0, len(params_list), chunk_size):
            chunk = params_list[i:i+chunk_size]
            await conn.execute(text(insert_query), chunk)
            print(f"Inserted {i+len(chunk)}/{len(params_list)}...")
            
    print("Migration complete! Database is now fully populated.")

if __name__ == "__main__":
    asyncio.run(import_parcels())
