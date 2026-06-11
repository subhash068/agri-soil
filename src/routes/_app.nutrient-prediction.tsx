import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { SEVERITY_COLOR, Severity } from "@/lib/mock-data";
import { Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GeographicFilter } from "@/components/GeographicFilter";
import { useAppStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/nutrient-prediction")({
  head: () => ({ meta: [{ title: "Nutrient Prediction Center — AgriSoil AI" }] }),
  component: NutrientPrediction,
});

function getSeverity(val: number, min: number, max: number): Severity {
  if (val >= min && val <= max) return "Normal";
  const diff = val < min ? min - val : val - max;
  const range = max - min || 1;
  const pct = diff / range;
  
  if (pct < 0.2) return "Mild";
  if (pct < 0.5) return "Moderate";
  if (pct < 0.8) return "Severe";
  return "Critical";
}

function NutrientPrediction() {
  const { district, mandal, village } = useAppStore();

  let level = "district";
  let targetName = district || "Statewide";

  if (village && village !== "All Villages") {
    level = "village";
    targetName = village;
  } else if (mandal && mandal !== "All Mandals") {
    level = "mandal";
    targetName = mandal;
  }

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["map-metrics", level, district, mandal, village],
    queryFn: () => {
      let url = `http://localhost:8000/map/metrics?level=${level}`;
      if (district && district !== "All Districts") url += `&district=${district}`;
      if (mandal && mandal !== "All Mandals") url += `&mandal=${mandal}`;
      return fetch(url).then(r => r.json());
    }
  });

  const targetKey = Object.keys(metrics || {}).find(k => k.toLowerCase() === targetName.toLowerCase()) || targetName;
  const distMetrics = metrics?.[targetKey] || { 
    Nitrogen: 210, Phosphorus: 24, Potassium: 312, pH: 7.4, 
    "Organic Carbon": 0.48, EC: 0.42,
    Iron: 6.1, Zinc: 0.42, Copper: 0.9, Boron: 0.38
  };

  const getStat = (key: string, fallbackVal: number, fallbackConf: number) => {
    const stat = distMetrics[`${key}_stats`];
    if (stat) {
      return { 
        val: stat.value, 
        low: Number(stat.low.toFixed(key === "pH" ? 1 : key === "Nitrogen" || key === "Phosphorus" || key === "Potassium" ? 0 : 2)),
        high: Number(stat.high.toFixed(key === "pH" ? 1 : key === "Nitrogen" || key === "Phosphorus" || key === "Potassium" ? 0 : 2)),
        conf: stat.confidence 
      };
    }
    const isWhole = key === "Nitrogen" || key === "Phosphorus" || key === "Potassium";
    const baseLow = key === "pH" ? fallbackVal - 0.3 : fallbackVal * 0.9;
    const baseHigh = key === "pH" ? fallbackVal + 0.3 : fallbackVal * 1.1;
    return {
      val: fallbackVal,
      low: Number(baseLow.toFixed(key === "pH" ? 1 : isWhole ? 0 : 2)),
      high: Number(baseHigh.toFixed(key === "pH" ? 1 : isWhole ? 0 : 2)),
      conf: fallbackConf
    };
  };

  const pStats = {
    ph: getStat("pH", 7.4, 94),
    ec: getStat("EC", 0.42, 90),
    oc: getStat("Organic Carbon", 0.48, 86),
    n: getStat("Nitrogen", 210, 88),
    p: getStat("Phosphorus", 24, 83),
    k: getStat("Potassium", 312, 91),
    fe: getStat("Iron", 6.1, 80),
    zn: getStat("Zinc", 0.42, 79),
    cu: getStat("Copper", 0.9, 82),
    b: getStat("Boron", 0.38, 77),
  };

  const dynamicPredictions = [
    { key: "ph", name: "pH", value: Number(pStats.ph.val.toFixed(1)), unit: "", optimal: [6.5, 7.5], confidence: pStats.ph.conf, low: pStats.ph.low, high: pStats.ph.high },
    { key: "ec", name: "EC", value: Number(pStats.ec.val.toFixed(2)), unit: "dS/m", optimal: [0, 0.8], confidence: pStats.ec.conf, low: pStats.ec.low, high: pStats.ec.high },
    { key: "oc", name: "Organic Carbon", value: Number(pStats.oc.val.toFixed(2)), unit: "%", optimal: [0.75, 1.5], confidence: pStats.oc.conf, low: pStats.oc.low, high: pStats.oc.high },
    { key: "n", name: "Nitrogen", value: Number(pStats.n.val.toFixed(0)), unit: "kg/ha", optimal: [280, 560], confidence: pStats.n.conf, low: pStats.n.low, high: pStats.n.high },
    { key: "p", name: "Phosphorus", value: Number(pStats.p.val.toFixed(0)), unit: "kg/ha", optimal: [28, 56], confidence: pStats.p.conf, low: pStats.p.low, high: pStats.p.high },
    { key: "k", name: "Potassium", value: Number(pStats.k.val.toFixed(0)), unit: "kg/ha", optimal: [280, 560], confidence: pStats.k.conf, low: pStats.k.low, high: pStats.k.high },
    { key: "fe", name: "Iron", value: Number(pStats.fe.val.toFixed(1)), unit: "ppm", optimal: [4.5, 10], confidence: pStats.fe.conf, low: pStats.fe.low, high: pStats.fe.high },
    { key: "zn", name: "Zinc", value: Number(pStats.zn.val.toFixed(2)), unit: "ppm", optimal: [0.6, 1.2], confidence: pStats.zn.conf, low: pStats.zn.low, high: pStats.zn.high },
    { key: "cu", name: "Copper", value: Number(pStats.cu.val.toFixed(2)), unit: "ppm", optimal: [0.2, 2], confidence: pStats.cu.conf, low: pStats.cu.low, high: pStats.cu.high },
    { key: "b", name: "Boron", value: Number(pStats.b.val.toFixed(2)), unit: "ppm", optimal: [0.5, 1], confidence: pStats.b.conf, low: pStats.b.low, high: pStats.b.high },
  ].map(p => {
    const val = p.value;
    const severity = getSeverity(val, p.optimal[0], p.optimal[1]);
    return { ...p, severity };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Brain className="h-5 w-5" />}
        title="Nutrient Prediction Center"
        description={`AI predictions from Sentinel-2, Planet imagery, Soil Health Cards, APSAC maps, weather & groundwater · ${targetName}`}
        actions={
          <div className="flex items-center gap-4">
            <GeographicFilter />
          </div>
        }
      />
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Panel key={i} bodyClassName="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="mt-2 h-8 w-24" />
              <Skeleton className="mt-1 h-3 w-32" />
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
              <Skeleton className="mt-2 h-3 w-28" />
            </Panel>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {dynamicPredictions.map((n) => (
            <Panel key={n.key} bodyClassName="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{n.name}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: SEVERITY_COLOR[n.severity] }}>
                  {n.severity}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums">
                {n.value}
                <span className="ml-1 text-sm font-medium text-muted-foreground">{n.unit}</span>
              </p>
              <p className="text-xs text-muted-foreground">Range {n.low}–{n.high} {n.unit}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-semibold">{n.confidence}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${n.confidence}%` }} />
                </div>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Optimal {n.optimal[0]}–{n.optimal[1]} {n.unit}</p>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
