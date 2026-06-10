from fastapi import FastAPI, Depends, UploadFile, File, Form, Query
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

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Create all tables; ideally use alembic for migrations
        await conn.run_sync(Base.metadata.create_all)

@app.get("/districts", response_model=List[str])
async def get_districts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Parcel.district).distinct())
    districts = result.scalars().all()
    if not districts:
        return ["West Godavari", "East Godavari", "Krishna", "Guntur", "Prakasam"]
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
    db: AsyncSession = Depends(get_db)
):
    stmt = select(models.Parcel)
    if district:
        stmt = stmt.where(models.Parcel.district == district)
    if mandal:
        stmt = stmt.where(models.Parcel.mandal == mandal)
        
    result = await db.execute(stmt)
    parcels = result.scalars().all()
    return parcels

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
    return schemas.FertilizerRecoResponse(
        crop=req.crop or "Paddy",
        fertilizer_name="Urea",
        dosage_kg_per_acre=50,
        dosage_kg_total=100,
        timing="Vegetative",
        application_method="Broadcast",
        cost_rs_per_acre=1200,
        expected_yield_gain_percent=15,
        confidence=90,
        reason="Nitrogen deficiency detected",
        nutrient_deficiencies=[],
        nitrogen_deficiency_probability=80,
        phosphate_deficiency_probability=20,
        potassium_deficiency_probability=10
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
        vil_name = row.properties.get('vilnam_soi') or row.properties.get('vilname11') or row.properties.get('village_name') or row.properties.get('VILLAGE') or row.properties.get('NAME')
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
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'EC'), Float)).label("EC"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Organic_Carbon'), Float)).label("Organic Carbon"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Nitrogen'), Float)).label("Nitrogen"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Phosphorus'), Float)).label("Phosphorus"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Potassium'), Float)).label("Potassium"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Iron'), Float)).label("Iron"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Zinc'), Float)).label("Zinc"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Copper'), Float)).label("Copper"),
        func.avg(cast(func.json_extract_path_text(models.Parcel.analytics, 'Boron'), Float)).label("Boron"),
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
        
        output[name] = {
            "Total Parcels": int(row.totalParcels) if getattr(row, 'totalParcels', None) is not None else 0,
            "soilHealth": health,
            "Soil Healthy %": health,
            "Soil Unhealthy %": max(0.0, 100.0 - health),
            "pH": float(row.pH) if row.pH is not None else 0.0,
            "EC": float(row.EC) if row.EC is not None else 0.0,
            "Organic Carbon": float(row[4]) if row[4] is not None else 0.0,
            "Nitrogen": float(row.Nitrogen) if row.Nitrogen is not None else 0.0,
            "Phosphorus": float(row.Phosphorus) if row.Phosphorus is not None else 0.0,
            "Potassium": float(row.Potassium) if row.Potassium is not None else 0.0,
            "Iron": float(row.Iron) if row.Iron is not None else 0.0,
            "Zinc": float(row.Zinc) if row.Zinc is not None else 0.0,
            "Copper": float(row.Copper) if row.Copper is not None else 0.0,
            "Boron": float(row.Boron) if row.Boron is not None else 0.0,
        }
    return output
