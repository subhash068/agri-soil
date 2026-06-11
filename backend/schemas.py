from pydantic import BaseModel, Field
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime

class AlertCreateInput(BaseModel):
    type: str
    crop: str
    district: str
    severity: str
    time: str
    action: str

class AlertOut(AlertCreateInput):
    id: str

class SchemeCreateInput(BaseModel):
    title: str
    desc: str
    tag: str

class SchemeOut(SchemeCreateInput):
    id: str

class FarmerRegisterInput(BaseModel):
    farmer_name: str
    phone_number: str
    district: str
    mandal: str
    village: str
    survey_number: str
    crop_type: str
    land_area_acres: float
    parcel_id: str

class FarmerRegisterResponse(BaseModel):
    status: str
    parcel_id: str

class DashboardKpiOut(BaseModel):
    parcels_monitored: int
    healthy_crop_percent: float
    active_stress_alerts: int
    disease_accuracy_percent: float
    high_risk_mandal_count: int
    predicted_yield_loss_percent: float
    satellite_coverage_percent: float
    ai_confidence_score_percent: float
    updated_at: str

class LandingStatsOut(BaseModel):
    farmers_covered: int
    parcels_monitored: int
    avg_soil_health: float
    deficient_parcels: int
    recommendations: int
    farmer_savings_cr: float
    yield_improvement_percent: float

class HotspotOut(BaseModel):
    district: str
    nutrient: str
    severity: str
    parcels: int

class Analytics(BaseModel):
    ndvi: float
    evi: float
    ndre: float
    soil_moisture: float
    vegetation_stress: float
    anomaly_hotspots: float
    disease_probability: float
    insight: str
    recommendation: str
    model: str

class Geometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

class ParcelOut(BaseModel):
    id: str
    farmer: str
    village: str
    district: str
    mandal: str
    crop: str
    acreage: float
    health: float
    risk: str
    confidence: float
    lat: float
    lng: float
    ndvi: float
    evi: float
    ndre: float
    analytics: Dict[str, Any]
    outline: Optional[List[Tuple[float, float]]] = None
    geometry: Optional[Any] = None

class SupportCenter(BaseModel):
    id: str
    name: str
    type: str
    district: str
    mandal: Optional[str] = None
    address: str
    phone: Optional[str] = None
    hours: Optional[str] = None
    distance_km: Optional[float] = None

class NearestSupportCentersOut(BaseModel):
    centers: List[SupportCenter]
    query: Dict[str, Optional[str]]

class WeatherForecastPoint(BaseModel):
    day: str
    rainfall: float
    temp: float
    humidity: float
    drought: float

class WeatherDatasetPoint(WeatherForecastPoint):
    source: str

class WeatherLiveSummary(BaseModel):
    location: str
    updated_at: str
    temperature: float
    apparent_temperature: Optional[float] = None
    rainfall_24h: float
    humidity: float
    wind_speed: float
    weather_code: Optional[int] = None
    source: str

class PredictionOut(BaseModel):
    label: str
    probability: float
    severity: str
    crop: str
    horizon: str
    ensemble: str
    confidence_band: str

class FieldAdvisoryResponse(BaseModel):
    fieldId: str
    crop: str
    healthScorePct: float
    diseaseDetected: Dict[str, Any]
    aiRecommendation: Dict[str, Any]
    predictedRisk7Days: Dict[str, Any]
    weatherAlert: Dict[str, Any]

class FertilizerRecoRequest(BaseModel):
    crop: Optional[str] = None
    soil_health: Optional[str] = None
    growth_stage: Optional[str] = None
    weather_rainfall_mm: Optional[float] = None
    satellite_unified_health_index_pct: Optional[float] = None
    satellite_abiotic_stress_score_pct: Optional[float] = None
    satellite_soil_moisture_score_pct: Optional[float] = None
    disease_risk: Optional[str] = None
    pest_risk: Optional[str] = None

class FertilizerRecoResponse(BaseModel):
    crop: str
    fertilizer_name: str
    dosage_kg_per_acre: float
    dosage_kg_total: float
    timing: str
    application_method: str
    cost_rs_per_acre: float
    expected_yield_gain_percent: float
    confidence: float
    reason: str
    nutrient_deficiencies: List[Dict[str, Any]]
    nitrogen_deficiency_probability: float
    phosphate_deficiency_probability: float
    potassium_deficiency_probability: float

class FusionFuseInput(BaseModel):
    fieldId: str
    parcel_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    disease_detection_response: Optional[Dict[str, Any]] = None

class FusionResponseOut(BaseModel):
    parcel_id: Optional[str] = None
    fieldId: str
    crop: Optional[str] = None
    unified_health_index: float
    satellite_confidence: float
    photo_confidence: float
    unified_confidence: float
    disease_detected: Optional[Dict[str, Any]] = None
    abiotic_stress_score: float
    biotic_stress_score: float
    anomaly_deviation_score: float
    explanation: Optional[List[str]] = None
    fertilizer_recommendation: Optional[FertilizerRecoResponse] = None
    fusedRisk7Days: Dict[str, Any]
    recommendation: Dict[str, Any]

class DiseaseDetectionResponse(BaseModel):
    label: str
    severity: str
    confidence: float
    model: str
    top_k: List[Dict[str, Any]]
    crop_gate: Optional[Dict[str, Any]] = None
    mismatch_detected: Optional[bool] = None
    mismatch_reason: Optional[str] = None
    crop_hint: Optional[str] = None
    fertilizer_recommendation: Optional[FertilizerRecoResponse] = None

class CropRecoRequest(BaseModel):
    n: float
    p: float
    k: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class CropRecoResponse(BaseModel):
    recommended_crop: str
    confidence: float

class CropSuitabilityOut(BaseModel):
    name: str
    suitability: float
    season: str
    n: float
    p: float
    k: float
    stages: List[str]
    water_requirement_mm: int
    expected_yield_tons: float
    ai_reasoning: str
    implements: List[str]

class SoilTypeOut(BaseModel):
    id: str
    name: str
    water_holding_capacity: float
    drainage: str
    texture: str
    retention_score: float
    suitable_crops: List[str]
    color: str
    parcel_count: int = 0
    share: float = 0.0
