from fastapi import FastAPI, Depends, UploadFile, File, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
import json

from database import engine, Base, get_db
import models
import schemas

app = FastAPI(title="AgriShield AP Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

crop_model = None

@app.on_event("startup")
async def startup():
    global crop_model
    try:
        import joblib
        import os
        model_path = os.path.join(os.path.dirname(__file__), "crop_model.pkl")
        if os.path.exists(model_path):
            crop_model = joblib.load(model_path)
    except Exception as e:
        print("Could not load crop model:", e)
        
    async with engine.begin() as conn:
        # Create all tables; ideally use alembic for migrations
        await conn.run_sync(Base.metadata.create_all)

@app.get("/districts", response_model=List[str])
async def get_districts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Parcel.district).distinct())
    districts = result.scalars().all()
    if not districts:
        return ["West Godavari", "East Godavari", "Krishna", "NTR", "Prakasam"]
    return [d for d in districts if d]

@app.get("/mandals", response_model=List[str])
async def get_mandals(district: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Parcel.mandal).where(models.Parcel.district == district).distinct())
    mandals = result.scalars().all()
    return [m for m in mandals if m]

@app.get("/villages", response_model=List[str])
async def get_villages(district: str, mandal: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Parcel.village)
        .where(models.Parcel.district == district, models.Parcel.mandal == mandal)
        .distinct()
    )
    villages = result.scalars().all()
    return [v for v in villages if v]

@app.get("/alerts", response_model=List[schemas.AlertOut])
async def get_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Alert))
    alerts = result.scalars().all()
    return alerts

@app.post("/alerts", response_model=schemas.AlertOut)
async def create_alert(alert: schemas.AlertCreateInput, db: AsyncSession = Depends(get_db)):
    new_alert = models.Alert(**alert.model_dump())
    db.add(new_alert)
    await db.commit()
    await db.refresh(new_alert)
    return new_alert

@app.get("/schemes", response_model=List[schemas.Scheme])
async def get_schemes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Scheme))
    schemes = result.scalars().all()
    return schemes

@app.post("/farmers/register", response_model=schemas.FarmerRegisterResponse)
async def register_farmer(farmer: schemas.FarmerRegisterInput, db: AsyncSession = Depends(get_db)):
    new_farmer = models.Farmer(**farmer.model_dump())
    db.add(new_farmer)
    await db.commit()
    await db.refresh(new_farmer)
    return schemas.FarmerRegisterResponse(status="success", parcel_id=new_farmer.parcel_id)

@app.get("/dashboard/kpis", response_model=schemas.DashboardKpiOut)
async def get_kpis(db: AsyncSession = Depends(get_db)):
    # Calculate aggregations
    parcels_count = await db.scalar(select(func.count(models.Parcel.id))) or 0
    alerts_count = await db.scalar(select(func.count(models.Alert.id))) or 0
    avg_health = await db.scalar(select(func.avg(models.Parcel.health))) or 0.0

    return schemas.DashboardKpiOut(
        parcels_monitored=parcels_count,
        healthy_crop_percent=round(avg_health, 2),
        active_stress_alerts=alerts_count,
        disease_accuracy_percent=92.1,
        high_risk_mandal_count=5,
        predicted_yield_loss_percent=4.2,
        satellite_coverage_percent=98.0,
        ai_confidence_score_percent=89.5,
        updated_at="2026-06-06T10:00:00Z"
    )

@app.get("/parcels", response_model=List[schemas.ParcelOut])
async def get_parcels(
    district: Optional[str] = None,
    mandal: Optional[str] = None,
    village: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    # Select only the serializable columns — exclude the PostGIS binary geometry column
    cols = [
        models.Parcel.id, models.Parcel.farmer, models.Parcel.village,
        models.Parcel.district, models.Parcel.mandal, models.Parcel.crop,
        models.Parcel.acreage, models.Parcel.health, models.Parcel.risk,
        models.Parcel.confidence, models.Parcel.lat, models.Parcel.lng,
        models.Parcel.ndvi, models.Parcel.evi, models.Parcel.ndre,
        models.Parcel.analytics, models.Parcel.outline
    ]
    stmt = select(*cols)
    if district:
        stmt = stmt.where(models.Parcel.district == district)
    if mandal:
        stmt = stmt.where(models.Parcel.mandal == mandal)
    if village:
        stmt = stmt.where(models.Parcel.village == village)
        
    result = await db.execute(stmt)
    rows = result.all()
    return [dict(row._mapping) for row in rows]

@app.get("/weather", response_model=List[schemas.WeatherForecastPoint])
async def get_weather():
    return [
        schemas.WeatherForecastPoint(day="Mon", rainfall=12, temp=30, humidity=70, drought=0)
    ]

@app.get("/weather/live", response_model=schemas.WeatherLiveSummary)
async def get_weather_live():
    return schemas.WeatherLiveSummary(
        location="West Godavari",
        updated_at="2026-06-06T10:00:00Z",
        temperature=32.5,
        rainfall_24h=5.0,
        humidity=65.0,
        wind_speed=12.0,
        source="IMD"
    )

@app.get("/predictions", response_model=List[schemas.PredictionOut])
async def get_predictions():
    return []

@app.get("/field-advisory/{fieldId}", response_model=schemas.FieldAdvisoryResponse)
async def get_field_advisory(fieldId: str):
    return schemas.FieldAdvisoryResponse(
        fieldId=fieldId,
        crop="Paddy",
        healthScorePct=85,
        diseaseDetected={"name": "Blast", "probabilityPct": 15, "severity": "Low", "affectedAreaPct": 5},
        aiRecommendation={"title": "Monitor", "steps": ["Check water levels"]},
        predictedRisk7Days={"diseaseRisk": "Low", "pestRisk": "Low", "yieldLossRiskPct": 2},
        weatherAlert={"tone": "info", "message": "Clear skies", "guidance": "Normal operations"}
    )

@app.post("/recommend/fertilizer", response_model=schemas.FertilizerRecoResponse)
async def recommend_fertilizer(req: schemas.FertilizerRecoRequest):
    import re
    n = p = k = ph = 0.0
    if req.soil_health:
        n_match = re.search(r'N:([\d.]+)', req.soil_health)
        p_match = re.search(r'P:([\d.]+)', req.soil_health)
        k_match = re.search(r'K:([\d.]+)', req.soil_health)
        ph_match = re.search(r'pH:([\d.]+)', req.soil_health)
        
        n = float(n_match.group(1)) if n_match else 0
        p = float(p_match.group(1)) if p_match else 0
        k = float(k_match.group(1)) if k_match else 0
        ph = float(ph_match.group(1)) if ph_match else 0

    fertilizer_name = "NPK 19:19:19"
    reason = "Maintenance application for standard crop growth."
    dosage = 25
    method = "Broadcast"

    if n > 0 and n < 150:
        fertilizer_name = "Urea"
        reason = f"Nitrogen level ({n} kg/ha) is deficient for optimal growth."
        dosage = 50
    elif p > 0 and p < 30:
        fertilizer_name = "DAP"
        reason = f"Phosphorus level ({p} kg/ha) is deficient."
        dosage = 35
        method = "Basal application"
    elif k > 0 and k < 150:
        fertilizer_name = "MOP"
        reason = f"Potassium level ({k} kg/ha) is deficient."
        dosage = 40
    elif ph > 8.0:
        fertilizer_name = "Gypsum"
        reason = f"High soil alkalinity detected (pH {ph}). Needs correction."
        dosage = 100
        method = "Soil incorporation"
    elif ph > 0 and ph < 5.5:
        fertilizer_name = "Agri Lime"
        reason = f"High soil acidity detected (pH {ph}). Needs correction."
        dosage = 150
        method = "Soil incorporation"

    conf = 90
    if req.satellite_unified_health_index_pct:
        conf = int(req.satellite_unified_health_index_pct) + 10
        if conf > 98: conf = 98

    return schemas.FertilizerRecoResponse(
        crop=req.crop or "Unknown",
        fertilizer_name=fertilizer_name,
        dosage_kg_per_acre=dosage,
        dosage_kg_total=dosage * 2,
        timing="Vegetative",
        application_method=method,
        cost_rs_per_acre=dosage * 20,
        expected_yield_gain_percent=15,
        confidence=conf,
        reason=reason,
        nutrient_deficiencies=[],
        nitrogen_deficiency_probability=80 if n < 150 else 10,
        phosphate_deficiency_probability=80 if p < 30 else 10,
        potassium_deficiency_probability=80 if k < 150 else 10
    )

@app.post("/fusion/fuse", response_model=schemas.FusionResponseOut)
async def fusion_fuse(req: schemas.FusionFuseInput):
    return schemas.FusionResponseOut(
        parcel_id=req.parcel_id,
        fieldId=req.fieldId,
        crop="Paddy",
        unified_health_index=85.0,
        satellite_confidence=90.0,
        photo_confidence=85.0,
        unified_confidence=88.0,
        abiotic_stress_score=10.0,
        biotic_stress_score=15.0,
        anomaly_deviation_score=5.0,
        fusedRisk7Days={"diseaseRisk": "Low", "pestRisk": "Low", "yieldLossRiskPct": 2},
        recommendation={"title": "Maintain operations", "steps": ["Continue standard practice"]}
    )

@app.post("/disease/detect", response_model=schemas.DiseaseDetectionResponse)
async def detect_disease(file: UploadFile = File(...)):
    return schemas.DiseaseDetectionResponse(
        label="Healthy",
        severity="Low",
        confidence=95.0,
        model="ensemble_v2",
        top_k=[{"label": "Healthy", "score": 95.0}]
    )

@app.get("/support-centers/nearest", response_model=schemas.NearestSupportCentersOut)
async def get_nearest_support_centers(district: Optional[str] = None, mandal: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    stmt = select(models.SupportCenterDB)
    if district:
        stmt = stmt.where(models.SupportCenterDB.district == district)
    if mandal:
        stmt = stmt.where(models.SupportCenterDB.mandal == mandal)
        
    result = await db.execute(stmt)
    centers = result.scalars().all()
    
    # Map DB models to Pydantic schemas
    mapped_centers = []
    for c in centers:
        mapped_centers.append(schemas.SupportCenter(
            id=c.id,
            name=c.name,
            type=c.type,
            district=c.district,
            mandal=c.mandal,
            address=c.address,
            phone=c.phone,
            hours=c.hours
        ))
        
    return schemas.NearestSupportCentersOut(
        centers=mapped_centers,
        query={"district": district, "mandal": mandal}
    )

@app.get("/parcel/{parcel_id}")
async def get_parcel_by_id(parcel_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(models.Parcel).where(models.Parcel.id == parcel_id)
    result = await db.execute(stmt)
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
        
    return {
        "id": parcel.id,
        "farmer": parcel.farmer,
        "crop": parcel.crop,
        "district": parcel.district,
        "mandal": parcel.mandal,
        "village": parcel.village,
        "lat": parcel.lat,
        "lng": parcel.lng,
        "health": parcel.health
    }

@app.get("/boundaries/districts")
async def get_district_boundaries(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import text
    result = await db.execute(text("SELECT properties, ST_AsGeoJSON(geometry) as geom FROM district_boundaries"))
    features = []
    for row in result.all():
        features.append({
            "type": "Feature",
            "properties": row.properties,
            "geometry": json.loads(row.geom)
        })
    return {"type": "FeatureCollection", "features": features}

@app.get("/boundaries/mandals")
async def get_mandal_boundaries(district: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import text
    if district:
        # Use spatial join to ensure mandals fall within the correct district boundary
        stmt = text("""
            SELECT m.properties, ST_AsGeoJSON(m.geometry) as geom 
            FROM mandal_boundaries m
            JOIN district_boundaries d ON ST_Intersects(ST_Centroid(m.geometry), d.geometry)
            WHERE d.properties->>'NAME' ILIKE :d
        """)
        result = await db.execute(stmt, {"d": f"%{district}%"})
    else:
        stmt = text("SELECT properties, ST_AsGeoJSON(geometry) as geom FROM mandal_boundaries")
        result = await db.execute(stmt)
        
    features = []
    # To avoid duplicates if boundaries overlap slightly
    seen_mandals = set()
    for row in result.all():
        mandal_name = row.properties.get('sdtname') or row.properties.get('NAME_3') or row.properties.get('SUB_DIST') or row.properties.get('Mandal')
        if mandal_name in seen_mandals and mandal_name is not None:
            continue
        if mandal_name:
            seen_mandals.add(mandal_name)
            
        features.append({
            "type": "Feature",
            "properties": row.properties,
            "geometry": json.loads(row.geom)
        })
    return {"type": "FeatureCollection", "features": features}

@app.get("/boundaries/villages")
async def get_village_boundaries(district: Optional[str] = None, mandal: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import text
    query = "SELECT v.properties, ST_AsGeoJSON(v.geometry) as geom FROM village_boundaries v "
    params = {}
    
    if district:
        query += " JOIN district_boundaries d ON ST_Intersects(ST_Centroid(v.geometry), d.geometry) WHERE d.properties->>'NAME' ILIKE :d "
        params["d"] = f"%{district}%"
        if mandal:
            query += " AND v.mandal_name ILIKE :m "
            params["m"] = f"%{mandal}%"
    else:
        query += " WHERE 1=1 "
        if mandal:
            query += " AND v.mandal_name ILIKE :m "
            params["m"] = f"%{mandal}%"
            
    result = await db.execute(text(query), params)
    
    features = []
    seen_villages = set()
    for row in result.all():
        vil_name = row.properties.get('vilname11') or row.properties.get('vilnam_soi') or row.properties.get('village_name') or row.properties.get('VILLAGE') or row.properties.get('NAME')
        if vil_name in seen_villages and vil_name is not None and vil_name.strip() != "":
            continue
        if vil_name and vil_name.strip() != "":
            seen_villages.add(vil_name)
            
        features.append({
            "type": "Feature",
            "properties": row.properties,
            "geometry": json.loads(row.geom)
        })
    return {"type": "FeatureCollection", "features": features}
@app.get("/map/metrics")
async def get_map_metrics(
    level: Optional[str] = "district",
    district: Optional[str] = None,
    mandal: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import func, cast, Float
    
    if level == "village":
        group_col = models.Parcel.village
    elif level == "mandal":
        group_col = models.Parcel.mandal
    else:
        group_col = models.Parcel.district
        
    stmt = select(
        group_col,
        func.avg(models.Parcel.health).label("soilHealth"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'pH'), Float)).label("pH"),
        func.stddev_pop(cast(func.json_extract_path_text(models.Parcel.analytics, 'pH'), Float)).label("pH_std"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'EC'), Float)).label("EC"),
        func.stddev_pop(cast(func.json_extract_path_text(models.Parcel.analytics, 'EC'), Float)).label("EC_std"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Organic_Carbon'), Float)).label("Organic Carbon"),
        func.stddev_pop(cast(func.json_extract_path_text(models.Parcel.analytics, 'Organic_Carbon'), Float)).label("Organic_Carbon_std"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Nitrogen'), Float)).label("Nitrogen"),
        func.stddev_pop(cast(func.json_extract_path_text(models.Parcel.analytics, 'Nitrogen'), Float)).label("Nitrogen_std"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Phosphorus'), Float)).label("Phosphorus"),
        func.stddev_pop(cast(func.json_extract_path_text(models.Parcel.analytics, 'Phosphorus'), Float)).label("Phosphorus_std"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Potassium'), Float)).label("Potassium"),
        func.stddev_pop(cast(func.json_extract_path_text(models.Parcel.analytics, 'Potassium'), Float)).label("Potassium_std"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Iron'), Float)).label("Iron"),
        func.stddev_pop(cast(func.json_extract_path_text(models.Parcel.analytics, 'Iron'), Float)).label("Iron_std"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Zinc'), Float)).label("Zinc"),
        func.stddev_pop(cast(func.json_extract_path_text(models.Parcel.analytics, 'Zinc'), Float)).label("Zinc_std"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Copper'), Float)).label("Copper"),
        func.stddev_pop(cast(func.json_extract_path_text(models.Parcel.analytics, 'Copper'), Float)).label("Copper_std"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Boron'), Float)).label("Boron"),
        func.stddev_pop(cast(func.json_extract_path_text(models.Parcel.analytics, 'Boron'), Float)).label("Boron_std"),
        func.mode().within_group(func.json_extract_path_text(models.Parcel.analytics, 'Soil_Type')).label("Soil_Type"),
        func.count(models.Parcel.id).label("totalParcels")
    )
    
    if district:
        stmt = stmt.where(models.Parcel.district.ilike(f"%{district}%"))
    if mandal:
        stmt = stmt.where(models.Parcel.mandal.ilike(f"%{mandal}%"))
        
    stmt = stmt.group_by(group_col)

    result = await db.execute(stmt)
    
    output = {}
    for row in result.all():
        name = row[0]
        if not name: continue
        
        health = float(row.soilHealth) if row.soilHealth is not None else 0.0
        
        def safe_float(val, default=0.0):
            return float(val) if val is not None else default
            
        def compute_stats(avg, std):
            a = safe_float(avg)
            s = safe_float(std, default=a * 0.1) # fallback to 10% std if none
            conf = min(99, max(70, 100 - (s / a * 100))) if a > 0 else 80
            return {
                "value": a,
                "low": a - s,
                "high": a + s,
                "confidence": int(conf)
            }
        
        output[name] = {
            "Total Parcels": int(row.totalParcels) if getattr(row, 'totalParcels', None) is not None else 0,
            "Soil_Type": getattr(row, 'Soil_Type', "Unknown") or "Unknown",
            "Soil Healthy %": health,
            "soilHealth": health,
            "Soil Unhealthy %": max(0.0, 100.0 - health),
            "pH": safe_float(row.pH),
            "pH_stats": compute_stats(row.pH, row.pH_std),
            "EC": safe_float(row.EC),
            "EC_stats": compute_stats(row.EC, row.EC_std),
            "Organic Carbon": safe_float(row[6]), # OC avg index due to label matching issue sometimes
            "Organic Carbon_stats": compute_stats(row[6], row.Organic_Carbon_std),
            "Nitrogen": safe_float(row.Nitrogen),
            "Nitrogen_stats": compute_stats(row.Nitrogen, row.Nitrogen_std),
            "Phosphorus": safe_float(row.Phosphorus),
            "Phosphorus_stats": compute_stats(row.Phosphorus, row.Phosphorus_std),
            "Potassium": safe_float(row.Potassium),
            "Potassium_stats": compute_stats(row.Potassium, row.Potassium_std),
            "Iron": safe_float(row.Iron),
            "Iron_stats": compute_stats(row.Iron, row.Iron_std),
            "Zinc": safe_float(row.Zinc),
            "Zinc_stats": compute_stats(row.Zinc, row.Zinc_std),
            "Copper": safe_float(row.Copper),
            "Copper_stats": compute_stats(row.Copper, row.Copper_std),
            "Boron": safe_float(row.Boron),
            "Boron_stats": compute_stats(row.Boron, row.Boron_std)
        }
    return output

@app.get("/soil-types", response_model=List[schemas.SoilTypeOut])
async def get_soil_types(
    district: Optional[str] = None,
    mandal: Optional[str] = None,
    village: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import text
    
    # 1. Get all soil types from reference table
    result = await db.execute(select(models.SoilType))
    soil_types = result.scalars().all()
    
    # 2. Get parcel counts per soil type from parcel analytics
    count_query = "SELECT analytics->>'Soil_Type' as soil_type, COUNT(*) as cnt FROM parcels WHERE 1=1"
    params = {}
    if district:
        count_query += " AND district ILIKE :d"
        params["d"] = f"%{district}%"
    if mandal:
        count_query += " AND mandal ILIKE :m"
        params["m"] = f"%{mandal}%"
    if village:
        count_query += " AND village ILIKE :v"
        params["v"] = f"%{village}%"
    count_query += " GROUP BY analytics->>'Soil_Type'"
    
    count_result = await db.execute(text(count_query), params)
    parcel_counts = {row.soil_type: row.cnt for row in count_result.all() if row.soil_type}
    
    total_parcels = sum(parcel_counts.values()) or 1
    
    # 3. Merge reference data with live parcel counts
    output = []
    for st in soil_types:
        count = parcel_counts.get(st.name, 0)
        # Also try matching texture-based names (e.g. "Clay" matches "Clay" soil type)
        if count == 0:
            for pname, pcount in parcel_counts.items():
                if pname and st.name and pname.lower() in st.name.lower():
                    count = pcount
                    break
        
        crops = st.suitable_crops if isinstance(st.suitable_crops, list) else json.loads(st.suitable_crops) if st.suitable_crops else []
        
        output.append(schemas.SoilTypeOut(
            id=st.id,
            name=st.name,
            water_holding_capacity=st.water_holding_capacity or 0,
            drainage=st.drainage or "Unknown",
            texture=st.texture or "Unknown",
            retention_score=st.retention_score or 0,
            suitable_crops=crops,
            color=st.color or "var(--color-chart-1)",
            parcel_count=count,
            share=round((count / total_parcels) * 100, 1) if count > 0 else 0
        ))
    
    # Sort by share descending
    output.sort(key=lambda x: x.share, reverse=True)
    return output

@app.get("/soil-types/analytics")
async def get_soil_type_analytics(
    district: Optional[str] = None,
    mandal: Optional[str] = None,
    village: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import text
    
    # 1. Average nutrient values per soil type
    nutrient_query = """
        SELECT 
            analytics->>'Soil_Type' as soil_type,
            COUNT(*) as parcel_count,
            AVG(CAST(analytics->>'pH' AS FLOAT)) as avg_ph,
            AVG(CAST(analytics->>'EC' AS FLOAT)) as avg_ec,
            AVG(CAST(analytics->>'Organic_Carbon' AS FLOAT)) as avg_oc,
            AVG(CAST(analytics->>'Nitrogen' AS FLOAT)) as avg_n,
            AVG(CAST(analytics->>'Phosphorus' AS FLOAT)) as avg_p,
            AVG(CAST(analytics->>'Potassium' AS FLOAT)) as avg_k,
            AVG(CAST(analytics->>'Zinc' AS FLOAT)) as avg_zn,
            AVG(CAST(analytics->>'Iron' AS FLOAT)) as avg_fe,
            AVG(CAST(analytics->>'Copper' AS FLOAT)) as avg_cu,
            AVG(CAST(analytics->>'Boron' AS FLOAT)) as avg_b,
            AVG(health) as avg_health
        FROM parcels WHERE 1=1
    """
    params = {}
    if district:
        nutrient_query += " AND district ILIKE :d"
        params["d"] = f"%{district}%"
    if mandal:
        nutrient_query += " AND mandal ILIKE :m"
        params["m"] = f"%{mandal}%"
    if village:
        nutrient_query += " AND village ILIKE :v"
        params["v"] = f"%{village}%"
    nutrient_query += " GROUP BY analytics->>'Soil_Type' ORDER BY parcel_count DESC"
    
    result = await db.execute(text(nutrient_query), params)
    
    nutrients = {}
    for row in result.all():
        if not row.soil_type:
            continue
        nutrients[row.soil_type] = {
            "parcel_count": row.parcel_count,
            "avg_ph": round(float(row.avg_ph or 0), 2),
            "avg_ec": round(float(row.avg_ec or 0), 2),
            "avg_oc": round(float(row.avg_oc or 0), 2),
            "avg_n": round(float(row.avg_n or 0), 1),
            "avg_p": round(float(row.avg_p or 0), 1),
            "avg_k": round(float(row.avg_k or 0), 1),
            "avg_zn": round(float(row.avg_zn or 0), 2),
            "avg_fe": round(float(row.avg_fe or 0), 2),
            "avg_fe": round(float(row.avg_fe or 0), 2),
            "avg_cu": round(float(row.avg_cu or 0), 2),
            "avg_b": round(float(row.avg_b or 0), 2),
            "avg_health": round(float(row.avg_health or 0), 1),
        }
    
    # 2. Irrigation type distribution per soil type
    irrigation_query = """
        SELECT 
            analytics->>'Soil_Type' as soil_type,
            analytics->>'Irrigation_Type' as irrigation,
            COUNT(*) as cnt
        FROM parcels WHERE 1=1
    """
    if district:
        irrigation_query += " AND district ILIKE :d"
    if mandal:
        irrigation_query += " AND mandal ILIKE :m"
    if village:
        irrigation_query += " AND village ILIKE :v"
    irrigation_query += " GROUP BY analytics->>'Soil_Type', analytics->>'Irrigation_Type' ORDER BY cnt DESC"
    
    irr_result = await db.execute(text(irrigation_query), params)
    
    irrigation = {}
    for row in irr_result.all():
        if not row.soil_type or not row.irrigation:
            continue
        if row.soil_type not in irrigation:
            irrigation[row.soil_type] = {}
        irrigation[row.soil_type][row.irrigation] = row.cnt
    
    # 3. Crop distribution per soil type
    crop_query = """
        SELECT 
            analytics->>'Soil_Type' as soil_type,
            crop,
            COUNT(*) as cnt
        FROM parcels WHERE 1=1
    """
    if district:
        crop_query += " AND district ILIKE :d"
    if mandal:
        crop_query += " AND mandal ILIKE :m"
    if village:
        crop_query += " AND village ILIKE :v"
    crop_query += " GROUP BY analytics->>'Soil_Type', crop ORDER BY cnt DESC"
    
    crop_result = await db.execute(text(crop_query), params)
    
    crops = {}
    for row in crop_result.all():
        if not row.soil_type or not row.crop:
            continue
        if row.soil_type not in crops:
            crops[row.soil_type] = {}
        crops[row.soil_type][row.crop] = row.cnt
    
    return {
        "nutrients": nutrients,
        "irrigation": irrigation,
        "crops": crops,
    }

@app.post("/recommend/crop", response_model=schemas.CropRecoResponse)
async def recommend_crop(req: schemas.CropRecoRequest):
    if crop_model is None:
        raise HTTPException(status_code=503, detail="Crop recommendation model is not loaded")
    import numpy as np
    features = np.array([[req.n, req.p, req.k, req.temperature, req.humidity, req.ph, req.rainfall]])
    pred = crop_model.predict(features)
    proba = crop_model.predict_proba(features)
    conf = np.max(proba) * 100
    
    return schemas.CropRecoResponse(
        recommended_crop=pred[0],
        confidence=round(conf, 2)
    )
