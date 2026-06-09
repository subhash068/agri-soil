from sqlalchemy import Column, String, Float, Integer, JSON
from geoalchemy2 import Geometry
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    type = Column(String)
    crop = Column(String)
    district = Column(String)
    severity = Column(String)
    time = Column(String)
    action = Column(String)

class Scheme(Base):
    __tablename__ = "schemes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String)
    desc = Column(String)
    tag = Column(String)

class Farmer(Base):
    __tablename__ = "farmers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    farmer_name = Column(String)
    phone_number = Column(String)
    district = Column(String)
    mandal = Column(String)
    village = Column(String)
    survey_number = Column(String)
    crop_type = Column(String)
    land_area_acres = Column(Float)
    parcel_id = Column(String)

class Parcel(Base):
    __tablename__ = "parcels"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    farmer = Column(String)
    village = Column(String)
    district = Column(String)
    mandal = Column(String)
    crop = Column(String)
    acreage = Column(Float)
    health = Column(Float)
    risk = Column(String)
    confidence = Column(Float)
    lat = Column(Float)
    lng = Column(Float)
    ndvi = Column(Float)
    evi = Column(Float)
    ndre = Column(Float)
    analytics = Column(JSON) # Store as JSON
    outline = Column(JSON)   # List of points
    geometry = Column(Geometry(geometry_type='POLYGON', srid=4326))

class SupportCenterDB(Base):
    __tablename__ = "support_centers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    type = Column(String)
    district = Column(String)
    mandal = Column(String, nullable=True)
    address = Column(String)
    phone = Column(String, nullable=True)
    hours = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

class DistrictBoundary(Base):
    __tablename__ = "district_boundaries"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    properties = Column(JSON)
    geometry = Column(Geometry(geometry_type='GEOMETRY', srid=4326))

class MandalBoundary(Base):
    __tablename__ = "mandal_boundaries"
    id = Column(String, primary_key=True, default=generate_uuid)
    district_name = Column(String)
    mandal_name = Column(String)
    properties = Column(JSON)
    geometry = Column(Geometry(geometry_type='GEOMETRY', srid=4326))

class VillageBoundary(Base):
    __tablename__ = "village_boundaries"
    id = Column(String, primary_key=True, default=generate_uuid)
    district_name = Column(String)
    mandal_name = Column(String)
    village_name = Column(String)
    properties = Column(JSON)
    geometry = Column(Geometry(geometry_type='GEOMETRY', srid=4326))

# --- New Reference & Analytics Models ---

class SoilType(Base):
    __tablename__ = "soil_types"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True)
    water_holding_capacity = Column(Float)
    drainage = Column(String)
    texture = Column(String)
    retention_score = Column(Float)
    suitable_crops = Column(JSON) # e.g., ["Cotton", "Red Gram"]
    color = Column(String)

class CropCatalog(Base):
    __tablename__ = "crop_catalog"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True)
    season = Column(String)
    optimal_n = Column(Float)
    optimal_p = Column(Float)
    optimal_k = Column(Float)
    growth_stages = Column(JSON) # e.g., ["Sowing", "Flowering"]

class NutrientThreshold(Base):
    __tablename__ = "nutrient_thresholds"
    id = Column(String, primary_key=True, default=generate_uuid)
    nutrient_key = Column(String, index=True) # e.g., "zn", "n"
    nutrient_name = Column(String)
    unit = Column(String)
    optimal_min = Column(Float)
    optimal_max = Column(Float)
    critical_low = Column(Float)
    critical_high = Column(Float)

class FertilizerCatalog(Base):
    __tablename__ = "fertilizer_catalog"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    n_content_pct = Column(Float, default=0.0)
    p_content_pct = Column(Float, default=0.0)
    k_content_pct = Column(Float, default=0.0)
    cost_per_kg = Column(Float)
    application_timing = Column(String)

class HistoricalSoilTest(Base):
    __tablename__ = "historical_soil_tests"
    id = Column(String, primary_key=True, default=generate_uuid)
    parcel_id = Column(String, index=True) # FK to parcels if enforced
    test_date = Column(String) # e.g., YYYY-MM-DD
    analytics = Column(JSON) # Snapshot of pH, NPK, EC
