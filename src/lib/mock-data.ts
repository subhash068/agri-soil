// AgriSoil AI — deterministic mock domain data (Andhra Pradesh).
// Seeded PRNG keeps SSR + client renders identical.

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(424242);
const rand = (min: number, max: number, d = 0) => {
  const v = min + rnd() * (max - min);
  return d === 0 ? Math.round(v) : Number(v.toFixed(d));
};

export type HealthCategory = "Excellent" | "Good" | "Moderate" | "Poor" | "Critical";
export type Severity = "Normal" | "Mild" | "Moderate" | "Severe" | "Critical";

export interface District {
  id: string;
  name: string;
  farmers: number;
  parcels: number;
  soilHealth: number;
  deficiencyRate: number;
  adoption: number;
  groundwaterStress: number;
  yieldGain: number;
  savings: number; // ₹ crore
  // normalized 0..1 layout position for the schematic map
  x: number;
  y: number;
  dominantSoil: string;
}

export const DISTRICTS: District[] = [
  { id: "GNT", name: "Guntur", x: 0.46, y: 0.52, dominantSoil: "Black Soil" },
  { id: "KRI", name: "Krishna", x: 0.55, y: 0.42, dominantSoil: "Alluvial Soil" },
  { id: "PKM", name: "Prakasam", x: 0.42, y: 0.66, dominantSoil: "Red Soil" },
  { id: "EG", name: "East Godavari", x: 0.7, y: 0.34, dominantSoil: "Alluvial Soil" },
  { id: "WG", name: "West Godavari", x: 0.62, y: 0.36, dominantSoil: "Alluvial Soil" },
  { id: "KNL", name: "Kurnool", x: 0.24, y: 0.5, dominantSoil: "Black Soil" },
  { id: "ATP", name: "Anantapur", x: 0.18, y: 0.66, dominantSoil: "Red Soil" },
].map((d) => ({
  ...d,
  farmers: rand(18000, 42000),
  parcels: rand(45000, 98000),
  soilHealth: rand(54, 82),
  deficiencyRate: rand(18, 41),
  adoption: rand(46, 88),
  groundwaterStress: rand(28, 78),
  yieldGain: rand(6, 19),
  savings: rand(8, 34, 1),
}));

export const MANDALS: Record<string, string[]> = {
  Guntur: ["Tenali", "Tadikonda", "Mangalagiri", "Pedakakani", "Prathipadu"],
  Krishna: ["Vijayawada Rural", "Gudivada", "Machilipatnam", "Nuzvid", "Avanigadda"],
  Prakasam: ["Ongole", "Markapur", "Kandukur", "Chirala", "Giddalur"],
  "East Godavari": ["Kakinada Rural", "Amalapuram", "Rajamahendravaram", "Peddapuram", "Mandapeta"],
  "West Godavari": ["Eluru", "Bhimavaram", "Tadepalligudem", "Tanuku", "Narsapuram"],
  Kurnool: ["Kurnool Rural", "Adoni", "Nandyal", "Yemmiganur", "Dhone"],
  Anantapur: ["Anantapur Rural", "Hindupur", "Dharmavaram", "Kalyandurg", "Guntakal"],
};

export const sum = (k: keyof District) => DISTRICTS.reduce((a, d) => a + (d[k] as number), 0);
export const avg = (k: keyof District) => Math.round(sum(k) / DISTRICTS.length);

export const STATE_KPIS = {
  farmers: sum("farmers"),
  parcels: sum("parcels"),
  soilHealth: avg("soilHealth"),
  deficiencyRate: avg("deficiencyRate"),
  adoption: avg("adoption"),
  yieldGain: avg("yieldGain"),
  savings: Number(DISTRICTS.reduce((a, d) => a + d.savings, 0).toFixed(1)),
  groundwaterStress: avg("groundwaterStress"),
  recommendations: 1_284_500,
  deficientParcels: Math.round(sum("parcels") * (avg("deficiencyRate") / 100)),
};

export function healthCategory(score: number): HealthCategory {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Moderate";
  if (score >= 35) return "Poor";
  return "Critical";
}

export const CATEGORY_COLOR: Record<HealthCategory, string> = {
  Excellent: "var(--color-success)",
  Good: "var(--color-chart-1)",
  Moderate: "var(--color-warning)",
  Poor: "var(--color-chart-4)",
  Critical: "var(--color-destructive)",
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  Normal: "var(--color-success)",
  Mild: "var(--color-chart-1)",
  Moderate: "var(--color-warning)",
  Severe: "var(--color-chart-4)",
  Critical: "var(--color-destructive)",
};

// ---------- Nutrients ----------
export interface NutrientPrediction {
  key: string;
  name: string;
  value: number;
  unit: string;
  low: number;
  high: number;
  confidence: number;
  severity: Severity;
  optimal: [number, number];
}

export const NUTRIENT_PREDICTIONS: NutrientPrediction[] = [
  { key: "ph", name: "pH", value: 7.4, unit: "", low: 7.1, high: 7.7, confidence: 94, severity: "Mild", optimal: [6.5, 7.5] },
  { key: "ec", name: "EC", value: 0.42, unit: "dS/m", low: 0.36, high: 0.49, confidence: 90, severity: "Normal", optimal: [0, 0.8] },
  { key: "oc", name: "Organic Carbon", value: 0.48, unit: "%", low: 0.41, high: 0.55, confidence: 86, severity: "Severe", optimal: [0.75, 1.5] },
  { key: "n", name: "Nitrogen", value: 210, unit: "kg/ha", low: 190, high: 230, confidence: 88, severity: "Moderate", optimal: [280, 560] },
  { key: "p", name: "Phosphorus", value: 24, unit: "kg/ha", low: 19, high: 29, confidence: 83, severity: "Severe", optimal: [28, 56] },
  { key: "k", name: "Potassium", value: 312, unit: "kg/ha", low: 288, high: 336, confidence: 91, severity: "Normal", optimal: [280, 560] },
  { key: "fe", name: "Iron", value: 6.1, unit: "ppm", low: 5.2, high: 7.0, confidence: 80, severity: "Mild", optimal: [4.5, 10] },
  { key: "zn", name: "Zinc", value: 0.42, unit: "ppm", low: 0.31, high: 0.53, confidence: 79, severity: "Critical", optimal: [0.6, 1.2] },
  { key: "cu", name: "Copper", value: 0.9, unit: "ppm", low: 0.7, high: 1.1, confidence: 82, severity: "Normal", optimal: [0.2, 2] },
  { key: "b", name: "Boron", value: 0.38, unit: "ppm", low: 0.29, high: 0.47, confidence: 77, severity: "Moderate", optimal: [0.5, 1] },
];

export const MAP_LAYERS = [
  { group: "Primary", layers: ["pH", "EC", "Organic Carbon"] },
  { group: "Macronutrients", layers: ["Nitrogen", "Phosphorus", "Potassium"] },
  { group: "Micronutrients", layers: ["Iron", "Zinc", "Copper", "Boron"] },
  { group: "Additional", layers: ["Groundwater", "Soil Moisture", "Weather", "Crop Coverage", "Fertilizer Demand"] },
];

// ---------- Soil types ----------
export interface SoilType {
  name: string;
  share: number;
  waterHolding: number;
  drainage: string;
  texture: string;
  retention: number;
  crops: string[];
  color: string;
}
export const SOIL_TYPES: SoilType[] = [
  { name: "Black Soil", share: 31, waterHolding: 88, drainage: "Poor", texture: "Clayey", retention: 84, crops: ["Cotton", "Red Gram", "Chilli"], color: "var(--color-chart-1)" },
  { name: "Red Soil", share: 27, waterHolding: 52, drainage: "Good", texture: "Loamy Sand", retention: 58, crops: ["Groundnut", "Millets", "Pulses"], color: "var(--color-chart-4)" },
  { name: "Alluvial Soil", share: 24, waterHolding: 74, drainage: "Moderate", texture: "Silt Loam", retention: 78, crops: ["Paddy", "Sugarcane", "Banana"], color: "var(--color-chart-2)" },
  { name: "Coastal Soil", share: 11, waterHolding: 61, drainage: "Moderate", texture: "Sandy Loam", retention: 49, crops: ["Coconut", "Cashew", "Paddy"], color: "var(--color-chart-6)" },
  { name: "Laterite Soil", share: 7, waterHolding: 44, drainage: "Excessive", texture: "Gravelly", retention: 41, crops: ["Cashew", "Tapioca", "Mango"], color: "var(--color-chart-5)" },
];

// ---------- Crops ----------
export interface Crop {
  name: string;
  suitability: number;
  season: "Kharif" | "Rabi" | "Summer";
  n: number;
  p: number;
  k: number;
  stages: string[];
}
export const CROPS: Crop[] = [
  { name: "Paddy", suitability: 85, season: "Kharif", n: 120, p: 60, k: 60, stages: ["Nursery", "Tillering", "Panicle", "Grain Fill", "Maturity"] },
  { name: "Cotton", suitability: 72, season: "Kharif", n: 150, p: 75, k: 75, stages: ["Sowing", "Squaring", "Flowering", "Boll", "Maturity"] },
  { name: "Groundnut", suitability: 78, season: "Rabi", n: 25, p: 50, k: 75, stages: ["Sowing", "Pegging", "Pod Dev", "Maturity"] },
  { name: "Red Gram", suitability: 69, season: "Kharif", n: 20, p: 50, k: 40, stages: ["Sowing", "Branching", "Flowering", "Pod Fill", "Maturity"] },
];

// ---------- Fertilizer recommendations ----------
export interface FertRec {
  name: string;
  dosage: string;
  timing: string;
  cost: number;
  yieldGain: number;
  reason: string;
}
export const FERT_RECS: FertRec[] = [
  { name: "Zinc Sulphate (21%)", dosage: "25 kg/ha", timing: "Basal — at sowing", cost: 1450, yieldGain: 7.2, reason: "Critical zinc deficiency (0.42 ppm) limiting tillering." },
  { name: "Urea (46% N)", dosage: "110 kg/ha", timing: "Split — 3 doses", cost: 2680, yieldGain: 9.4, reason: "Nitrogen at 210 kg/ha, below optimal 280–560." },
  { name: "DAP (18-46-0)", dosage: "60 kg/ha", timing: "Basal", cost: 2310, yieldGain: 5.1, reason: "Phosphorus 24 kg/ha is severely deficient." },
  { name: "Borax (10.5% B)", dosage: "8 kg/ha", timing: "Foliar — flowering", cost: 620, yieldGain: 2.8, reason: "Boron 0.38 ppm below 0.5 threshold." },
];

// ---------- Time series helpers ----------
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const deficiencyTrend = MONTHS.map((m, i) => ({
  month: m,
  Nitrogen: 38 - i * 0.6 + rand(-2, 2),
  Phosphorus: 44 - i * 0.5 + rand(-2, 2),
  Zinc: 51 - i * 0.9 + rand(-2, 2),
}));

export const fertilizerDemand = MONTHS.map((m) => ({
  month: m,
  Urea: rand(40, 95),
  DAP: rand(25, 70),
  MOP: rand(15, 48),
  Micronutrients: rand(8, 30),
}));

export const yieldForecast = ["2021", "2022", "2023", "2024", "2025*"].map((year, i) => ({
  year,
  actual: 38 + i * 1.6 + rand(-1, 1),
  potential: 44 + i * 2.1 + rand(-1, 1),
}));

export const soilHealthTrend = MONTHS.map((m, i) => ({ month: m, score: 58 + i * 0.9 + rand(-2, 2) }));

export const weatherSeries = MONTHS.map((m) => ({
  month: m,
  rainfall: rand(10, 240),
  temp: rand(24, 38),
  humidity: rand(48, 88),
  moisture: rand(18, 62),
}));

export const HEALTH_COMPONENTS = [
  { name: "pH Health", score: 82 },
  { name: "EC Health", score: 90 },
  { name: "Organic Carbon", score: 41 },
  { name: "Macronutrients", score: 58 },
  { name: "Micronutrients", score: 47 },
  { name: "Soil Type", score: 74 },
  { name: "Water Availability", score: 63 },
];

export const ANNOUNCEMENTS = [
  { tag: "Scheme", date: "05 Jun 2026", title: "Rythu Bharosa soil-card subsidy extended to Kharif 2026", level: "info" as const },
  { tag: "Advisory", date: "03 Jun 2026", title: "Zinc deficiency advisory issued for 14 Guntur mandals", level: "warning" as const },
  { tag: "Alert", date: "01 Jun 2026", title: "Groundwater stress critical in Anantapur — restrict paddy", level: "critical" as const },
  { tag: "Update", date: "28 May 2026", title: "Sentinel-2 nutrient model v4.2 deployed statewide", level: "info" as const },
];

export const HOTSPOTS = [
  { district: "Anantapur", nutrient: "Zinc", severity: "Critical" as Severity, parcels: 8420 },
  { district: "Kurnool", nutrient: "Organic Carbon", severity: "Severe" as Severity, parcels: 6190 },
  { district: "Prakasam", nutrient: "Phosphorus", severity: "Severe" as Severity, parcels: 5230 },
  { district: "Guntur", nutrient: "Boron", severity: "Moderate" as Severity, parcels: 3870 },
];

export const ADVISORIES = [
  { farmer: "K. Ramaiah", village: "Tadikonda", crop: "Cotton", action: "Apply Zinc Sulphate 25kg/ha", status: "Followed" },
  { farmer: "S. Lakshmi", village: "Ongole", crop: "Groundnut", action: "Foliar Borax at flowering", status: "Read" },
  { farmer: "M. Venkat", village: "Bhimavaram", crop: "Paddy", action: "Split Urea — reduce 2nd dose", status: "Delivered" },
  { farmer: "P. Nagini", village: "Adoni", crop: "Red Gram", action: "Gypsum 200kg/ha for sodicity", status: "Sent" },
];

export function districtRanking() {
  return [...DISTRICTS].sort((a, b) => b.soilHealth - a.soilHealth);
}
