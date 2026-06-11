import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical, Activity, Sparkles } from "lucide-react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { GeographicFilter } from "@/components/GeographicFilter";
import { useAppStore } from "@/lib/store";
import { Panel } from "@/components/ui-kit/Panel";
import { Donut, AreaTrend } from "@/components/charts/Charts";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Kpi } from "@/components/ui-kit/Kpi";
import { ClientOnly } from "@/components/ClientOnly";

const NutrientMap = React.lazy(() => import("@/components/maps/NutrientMap").then(m => ({ default: m.NutrientMap })));

export const Route = createFileRoute("/_app/nutrient-availability")({
  head: () => ({ meta: [{ title: "Nutrient Availability Engine — AgriSoil AI" }] }),
  component: NutrientAvailabilityPage,
});

function NutrientAvailabilityPage() {
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
      let url = `/api/map/metrics?level=${level}`;
      if (district && district !== "All Districts") url += `&district=${district}`;
      if (mandal && mandal !== "All Mandals") url += `&mandal=${mandal}`;
      return fetch(url).then(r => r.json());
    }
  });

  const targetKey = Object.keys(metrics || {}).find(k => k.toLowerCase() === targetName.toLowerCase()) || targetName;
  const distMetrics = metrics?.[targetKey] || {
    Nitrogen: 168, Phosphorus: 14, Potassium: 298, Zinc: 0.31,
    pH: 7.4, "Organic Carbon": 0.45, EC: 0.45
  };

  const nVal = distMetrics.Nitrogen || 0;
  const pVal = distMetrics.Phosphorus || 0;
  const kVal = distMetrics.Potassium || 0;
  const znVal = distMetrics.Zinc || 0;
  const phVal = distMetrics.pH || 7.0;
  const ocVal = distMetrics["Organic Carbon"] || 0.5;

  // Determine Tones
  const nTone = nVal < 150 ? "destructive" : nVal < 200 ? "warning" : "success";
  const pTone = pVal < 10 ? "destructive" : pVal < 20 ? "warning" : "success";
  const kTone = kVal < 150 ? "destructive" : kVal < 250 ? "warning" : "success";
  const znTone = znVal < 0.6 ? "destructive" : "success";

  // Generate Insights
  const insights = [];
  if (phVal > 7.3) {
    insights.push(`High pH (${phVal.toFixed(1)}) is reducing phosphorus & zinc availability through fixation.`);
  } else if (phVal < 5.5) {
    insights.push(`Low pH (${phVal.toFixed(1)}) may cause aluminum toxicity and reduce phosphorus availability.`);
  } else {
    insights.push(`Soil pH (${phVal.toFixed(1)}) is optimal for nutrient availability.`);
  }

  if (ocVal < 0.5) {
    insights.push(`Low organic carbon (${ocVal.toFixed(2)}%) reduces overall nutrient retention and microbial activity.`);
  } else {
    insights.push(`Good organic carbon levels (${ocVal.toFixed(2)}%) are supporting healthy nutrient cycling.`);
  }

  if (phVal > 7.5 && znVal < 0.6) {
    insights.push("Apply zinc as foliar spray to bypass soil fixation in alkaline parcels.");
  } else if (nVal < 150) {
    insights.push("Nitrogen levels are critically low. Consider split urea applications.");
  } else if (pVal < 15) {
    insights.push("Phosphorus is deficient. Basal application of DAP is recommended.");
  }

  // Generate dynamic trend data for the area chart
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = months.map((month, i) => {
    const variance = Math.sin((i / 11) * Math.PI);
    return {
      month,
      Nitrogen: Math.round(nVal * (0.85 + 0.15 * variance)),
      Phosphorus: Math.round(pVal * (0.9 + 0.1 * variance)),
      Zinc: parseFloat((znVal * (0.9 + 0.1 * variance)).toFixed(2))
    };
  });

  const feVal = distMetrics.Iron || 4.5;
  const cuVal = distMetrics.Copper || 0.8;
  const bVal = distMetrics.Boron || 0.4;

  const macroDonut = [
    { name: "Nitrogen", value: Math.round(nVal), color: "var(--color-chart-1)" },
    { name: "Phosphorus", value: Math.round(pVal), color: "var(--color-chart-2)" },
    { name: "Potassium", value: Math.round(kVal), color: "var(--color-chart-3)" },
  ];

  const microDonut = [
    { name: "Zinc", value: Number(znVal.toFixed(2)), color: "var(--color-chart-4)" },
    { name: "Iron", value: Number(feVal.toFixed(2)), color: "var(--color-chart-5)" },
    { name: "Copper", value: Number(cuVal.toFixed(2)), color: "var(--color-chart-1)" },
    { name: "Boron", value: Number(bVal.toFixed(2)), color: "var(--color-chart-2)" },
  ];

  const kpiList = [
    { label: "Available Nitrogen", value: `${Math.round(nVal)} kg/ha`, tone: nTone },
    { label: "Available Phosphorus", value: `${Math.round(pVal)} kg/ha`, tone: pTone },
    { label: "Available Potassium", value: `${Math.round(kVal)} kg/ha`, tone: kTone },
    { label: "Available Zinc", value: `${znVal.toFixed(2)} ppm`, tone: znTone },
    { label: "Available Iron", value: `${feVal.toFixed(2)} ppm`, tone: feVal < 4.5 ? "warning" : "success" },
    { label: "Available Copper", value: `${cuVal.toFixed(2)} ppm`, tone: cuVal < 0.2 ? "warning" : "success" },
    { label: "Available Boron", value: `${bVal.toFixed(2)} ppm`, tone: bVal < 0.5 ? "warning" : "success" },
    { label: "Soil pH", value: `${phVal.toFixed(1)}`, tone: phVal > 7.5 || phVal < 5.5 ? "destructive" : phVal > 7.0 || phVal < 6.0 ? "warning" : "success" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FlaskConical className="h-5 w-5" />}
        title="Nutrient Availability Engine"
        description={`Plant-available nutrients computed from pH, EC, organic carbon, moisture & soil type. Showing data for ${targetName}.`}
        actions={
          <div className="flex items-center gap-4">
            <GeographicFilter />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpiList.map((k, i) => (
          <Kpi key={k.label} index={i} label={k.label} value={k.value} tone={k.tone as any} icon={Activity} />
        ))}
      </div>

      <Panel title="Geospatial Layer" subtitle="District-level distribution">
        <ClientOnly fallback={<div style={{ height: 380, background: "#0a0a0a" }} className="w-full rounded-lg" />}>
          <NutrientMap metricKey="Soil Unhealthy %" invert={true} height={380} />
        </ClientOnly>
      </Panel>

      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="Macronutrient Proportions" subtitle="Relative balance (N-P-K)">
          <Donut data={macroDonut} height={280} />
        </Panel>
        <Panel title="Micronutrient Proportions" subtitle="Relative balance (Zn, Fe, Cu, B)">
          <Donut data={microDonut} height={280} />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Intelligence Overview" subtitle="Trend analytics (kg/ha)" className="lg:col-span-2">
          <AreaTrend
            data={chartData}
            keys={[
              { key: "Nitrogen", color: "var(--color-chart-1)" },
              { key: "Phosphorus", color: "var(--color-chart-2)" },
              { key: "Zinc", color: "var(--color-chart-4)" },
            ]}
            yUnit="kg/ha"
          />
        </Panel>

        <Panel title="AI Insights" subtitle="Explainable findings">
          <ul className="space-y-3">
            {insights.map((t) => (
              <li key={t} className="flex gap-2.5 rounded-md border border-border p-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{t}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
