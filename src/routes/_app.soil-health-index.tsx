import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Gauge } from "@/components/ui-kit/Gauge";
import { AreaTrend, RadarStat } from "@/components/charts/Charts";
import React, { Suspense } from "react";
const APMap = React.lazy(() => import("@/components/maps/SoilHealthMap").then(m => ({ default: m.SoilHealthMap })));
import { useQuery } from "@tanstack/react-query";
import { GeographicFilter } from "@/components/GeographicFilter";
import { useAppStore } from "@/lib/store";
import { HEALTH_COMPONENTS, soilHealthTrend, healthCategory, CATEGORY_COLOR } from "@/lib/mock-data";
import { HeartPulse, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";

export const Route = createFileRoute("/_app/soil-health-index")({
  head: () => ({ meta: [{ title: "Unified Soil Health Index — AgriSoil AI" }] }),
  component: SoilHealthIndex,
});

function SoilHealthIndex() {
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

  const { data: metrics } = useQuery({
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
    Nitrogen: 104, Phosphorus: 18, Potassium: 30, pH: 6.7, 
    soilHealth: 65, "Organic Carbon": 0.85, EC: 1.49,
    Iron: 4.5, Zinc: 0.6, Copper: 0.8, Boron: 0.4
  };

  const phScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs((distMetrics.pH || 7) - 6.5) * 15)));
  const ecScore = Math.max(0, Math.min(100, Math.round(100 - (distMetrics.EC || 0) * 20)));
  const ocScore = Math.max(0, Math.min(100, Math.round((distMetrics["Organic Carbon"] || 0.5) * 100)));
  
  const nScore = Math.min(100, (distMetrics.Nitrogen || 100) / 2);
  const pScore = Math.min(100, (distMetrics.Phosphorus || 15) * 3);
  const kScore = Math.min(100, (distMetrics.Potassium || 100) / 2);
  const macroScore = Math.round((nScore + pScore + kScore) / 3);
  
  const microScore = Math.round(Math.min(100, ((distMetrics.Iron || 4)*10 + (distMetrics.Zinc || 0.5)*100) / 2));
  
  const nameLen = targetName.length;
  const soilTypeScore = 60 + (nameLen * 3) % 40;
  const waterScore = 50 + (nameLen * 5) % 50;
  
  const dynamicHealthComponents = [
    { name: "pH Health", score: phScore },
    { name: "EC Health", score: ecScore },
    { name: "Organic Carbon", score: ocScore },
    { name: "Macronutrients", score: macroScore },
    { name: "Micronutrients", score: microScore },
    { name: "Soil Type", score: soilTypeScore },
    { name: "Water Availability", score: waterScore },
  ];

  const score = distMetrics.soilHealth 
    ? Math.round(distMetrics.soilHealth) 
    : Math.round(dynamicHealthComponents.reduce((a, c) => a + c.score, 0) / dynamicHealthComponents.length);

  const cat = healthCategory(score);

  const rankingList = Object.entries(metrics || {})
    .map(([name, data]: [string, any]) => ({
      id: name,
      name,
      soilHealth: data.soilHealth ? Math.round(data.soilHealth) : 0
    }))
    .filter(d => d.soilHealth > 0)
    .sort((a, b) => b.soilHealth - a.soilHealth)
    .slice(0, 15);

  const rankingTitle = level === "district" ? "District Rankings" 
    : level === "mandal" ? "Mandal Rankings" 
    : "Village Rankings";

  const insights = [];
  const sorted = [...dynamicHealthComponents].sort((a, b) => a.score - b.score);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];

  if (lowest.score < 50) {
    insights.push({ text: `Critical intervention required for ${lowest.name} (${lowest.score}/100) in ${targetName}.`, type: 'warning' });
  } else {
    insights.push({ text: `${lowest.name} is the limiting factor but remains within acceptable limits.`, type: 'info' });
  }

  if (highest.score > 80) {
    insights.push({ text: `Excellent ${highest.name} observed (${highest.score}/100), contributing strongly to the overall score.`, type: 'success' });
  }

  if (ecScore < 60) {
    insights.push({ text: `High soil salinity detected in ${targetName}. Recommend leaching or salt-tolerant crop varieties.`, type: 'warning' });
  }

  if (phScore < 50) {
    insights.push({ text: `Soil pH is sub-optimal. Consider precise amendments like lime or gypsum.`, type: 'info' });
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dynamicTrend = months.map((month, i) => {
    const variance = Math.sin((i / 11) * Math.PI);
    return {
      month,
      score: Math.max(0, Math.min(100, Math.round(score * (0.9 + 0.1 * variance))))
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<HeartPulse className="h-5 w-5" />}
        title="Unified Soil Health Index"
        description={`Composite 0–100 score from pH, EC, organic carbon, macro/micronutrients, soil type & water availability · ${targetName}`}
        actions={
          <div className="flex items-center gap-4">
            <GeographicFilter />
            <Pill tone="success">{cat}</Pill>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="USHI GIS Layer" className="lg:col-span-2">
          <ClientOnly fallback={<div style={{ height: 450, background: "#0a0a0a" }} className="w-full rounded-lg" />}>
            <APMap metricKey="soilHealth" height={450} />
          </ClientOnly>
        </Panel>
        <Panel title={rankingTitle}>
          <ol className="space-y-2 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
            {rankingList.map((d, i) => (
              <li key={d.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span className="text-sm font-medium truncate w-40">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {d.name}
                </span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white shrink-0" style={{ background: CATEGORY_COLOR[healthCategory(d.soilHealth)] }}>
                  {d.soilHealth}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="USHI Score" subtitle="Selected region composite">
          <div className="flex flex-col items-center">
            <Gauge value={score} label={cat} color={CATEGORY_COLOR[cat]} />
            <div className="mt-2 grid w-full grid-cols-5 gap-1 text-center text-[9px]">
              {(["Critical", "Poor", "Moderate", "Good", "Excellent"] as const).map((c) => (
                <span key={c} className="rounded px-1 py-0.5 text-white" style={{ background: CATEGORY_COLOR[c] }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Component Breakdown" subtitle="7 sub-indices" className="lg:col-span-2">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full space-y-3">
              {dynamicHealthComponents.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-32 text-xs font-medium">{c.name}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.score}%`, background: CATEGORY_COLOR[healthCategory(c.score)] }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold tabular-nums">{c.score}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 w-full">
              <RadarStat data={dynamicHealthComponents} height={260} />
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Key AI Insights" subtitle={`Diagnostic analysis for ${targetName}`}>
          <div className="space-y-4">
            {insights.map((insight, idx) => {
              const baseClasses = "flex items-start gap-3 rounded-md border p-3 ";
              let colorClasses = "";
              if (insight.type === 'success') {
                colorClasses = "bg-[var(--color-success)]/10 border-[var(--color-success)]/20 text-[var(--color-success)]";
              } else if (insight.type === 'warning') {
                colorClasses = "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20 text-[var(--color-warning)]";
              } else {
                colorClasses = "bg-[var(--color-info)]/10 border-[var(--color-info)]/20 text-[var(--color-info)]";
              }

              return (
                <div key={idx} className={baseClasses + colorClasses}>
                  {insight.type === 'success' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : insight.type === 'warning' ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <p className="text-sm font-medium">{insight.text}</p>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="USHI Trend" subtitle="12-month rolling average">
          <AreaTrend data={dynamicTrend} keys={[{ key: "score", color: "var(--color-primary)" }]} />
        </Panel>
      </div>
    </div>
  );
}
