import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { Boxes, Sparkles, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { MultiLine } from "@/components/charts/Charts";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/digital-twin")({
  head: () => ({ meta: [{ title: "Soil Digital Twin — AgriSoil AI" }] }),
  component: SoilDigitalTwin,
});

type Scenario = "no_intervention" | "recommended" | "alternative";

function SoilDigitalTwin() {
  const [horizon, setHorizon] = useState<number>(6); // months: 1 to 12
  const [scenario, setScenario] = useState<Scenario>("recommended");

  // Baseline Soil stats
  const baseOC = 0.48;
  const baseNPK = 55.0;
  const basePH = 7.4;

  // Calculate dynamic stats based on months and scenario
  let projectedOC = baseOC;
  let projectedNPK = baseNPK;
  let projectedPH = basePH;

  if (scenario === "no_intervention") {
    projectedOC = Math.max(0.32, baseOC - horizon * 0.015);
    projectedNPK = Math.max(38.0, baseNPK - horizon * 1.4);
    projectedPH = Math.max(5.8, basePH - horizon * 0.1);
  } else if (scenario === "recommended") {
    projectedOC = Math.min(0.75, baseOC + horizon * 0.022);
    projectedNPK = Math.min(94.0, baseNPK + horizon * 3.25);
    projectedPH = Math.max(6.8, basePH - horizon * 0.05);
  } else { // alternative (organic plan)
    projectedOC = Math.min(0.85, baseOC + horizon * 0.035);
    projectedNPK = Math.min(84.0, baseNPK + horizon * 2.2);
    projectedPH = Math.max(7.0, basePH - horizon * 0.03);
  }

  // Generate 12-month projections chart data for the active scenario
  const chartData = Array.from({ length: 13 }, (_, m) => {
    let oc = baseOC;
    let npk = baseNPK;
    let ph = basePH;

    if (scenario === "no_intervention") {
      oc = Math.max(0.32, baseOC - m * 0.015);
      npk = Math.max(38.0, baseNPK - m * 1.4);
      ph = Math.max(5.8, basePH - m * 0.1);
    } else if (scenario === "recommended") {
      oc = Math.min(0.75, baseOC + m * 0.022);
      npk = Math.min(94.0, baseNPK + m * 3.25);
      ph = Math.max(6.8, basePH - m * 0.05);
    } else {
      oc = Math.min(0.85, baseOC + m * 0.035);
      npk = Math.min(84.0, baseNPK + m * 2.2);
      ph = Math.max(7.0, basePH - m * 0.03);
    }

    return {
      month: `M${m}`,
      "Organic Carbon (%)": parseFloat((oc * 100).toFixed(0)), // convert to percentage scale for secondary line compatibility
      "NPK Health Index": Math.round(npk),
      "Soil pH": parseFloat((ph * 10).toFixed(0)), // scaled up for chart visibility alongside NPK
    };
  });

  // Calculate Soil health status label & color
  let statusText = "Healthy";
  let statusColor = "bg-primary/20 text-primary border-primary/40";
  let topSoilColor = "from-emerald-950/80 to-emerald-900/60";
  let subSoilColor = "from-amber-950/40 to-amber-900/20";
  let twinIcon = CheckCircle2;

  if (scenario === "no_intervention") {
    statusText = "Severe Depletion";
    statusColor = "bg-destructive/10 text-destructive border-destructive/30";
    topSoilColor = "from-zinc-800 to-zinc-900";
    subSoilColor = "from-orange-950/30 to-amber-950/10";
    twinIcon = AlertTriangle;
  } else if (scenario === "alternative") {
    statusText = "Highly Regenerative";
    statusColor = "bg-green-500/10 text-green-400 border-green-500/30";
    topSoilColor = "from-emerald-900 to-emerald-950";
    subSoilColor = "from-amber-900/50 to-amber-950/30";
  }

  const deltaOC = projectedOC - baseOC;
  const deltaNPK = projectedNPK - baseNPK;

  const insights = [
    scenario === "no_intervention"
      ? `Without replenishment, topsoil organic carbon drops below the critical 0.4% threshold in ${Math.round(4)} months, halting natural root respiration.`
      : scenario === "recommended"
      ? `Under standard chemical + micro-dosing, macronutrients stabilize within 3 months, creating optimal vegetative development conditions.`
      : `The organic-focused plan boosts soil water retention capacity by 18%, reducing watering frequency by Year 2.`,
    `Projected pH level stabilizes at ${projectedPH.toFixed(1)}, minimizing nutrient fixation locks and maximizing root availability.`,
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Boxes className="h-5 w-5" />}
        title="Soil Digital Twin"
        description="Simulate biological and chemical soil health changes across time horizons and agronomic strategies."
        actions={<Pill tone="info">Simulation Engine</Pill>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 animate-in fade-in duration-300">
        <Kpi index={0} label="Soil pH" value={projectedPH.toFixed(2)} tone={projectedPH < 6.2 ? "warning" : "success"} />
        <Kpi index={1} label="Organic Carbon" value={`${projectedOC.toFixed(2)}%`} tone={projectedOC >= 0.5 ? "success" : "destructive"} delta={parseFloat(deltaOC.toFixed(3))} />
        <Kpi index={2} label="NPK Health Index" value={`${Math.round(projectedNPK)}%`} tone={projectedNPK >= 75 ? "success" : "destructive"} delta={parseFloat(deltaNPK.toFixed(1))} />
        <Kpi index={3} label="Projected Status" value={statusText} tone={scenario === "no_intervention" ? "destructive" : "success"} icon={twinIcon} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <Panel title="Simulation Horizon" subtitle="Configure projection timeline">
            <div className="space-y-6 p-5">
              <div className="space-y-2">
                <Tabs value={scenario} onValueChange={(val) => setScenario(val as Scenario)}>
                  <TabsList className="grid grid-cols-3 bg-muted/40">
                    <TabsTrigger value="no_intervention" className="text-[11px] px-1 py-1.5">No Action</TabsTrigger>
                    <TabsTrigger value="recommended" className="text-[11px] px-1 py-1.5">Standard</TabsTrigger>
                    <TabsTrigger value="alternative" className="text-[11px] px-1 py-1.5">Organic</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span>Horizon Timeframe</span>
                  <span className="font-bold text-primary">{horizon} Months</span>
                </div>
                <div className="py-2">
                  <Slider min={1} max={12} step={1} value={[horizon]} onValueChange={(val) => setHorizon(val[0])} />
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-background/50 p-4 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Interactive Soil Profile Twin
                </p>
                <div className="space-y-2">
                  <div className={`rounded-md border border-border/50 bg-gradient-to-r ${topSoilColor} p-3 transition-all duration-700`}>
                    <p className="text-[10px] font-bold text-foreground/75">Topsoil Layer (0 - 15 cm)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Organic Matter: <span className="font-semibold text-foreground">{projectedOC.toFixed(2)}%</span>
                    </p>
                  </div>
                  <div className={`rounded-md border border-border/50 bg-gradient-to-r ${subSoilColor} p-3 transition-all duration-700`}>
                    <p className="text-[10px] font-bold text-foreground/75">Subsoil Layer (15 - 45 cm)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rooting Zone pH: <span className="font-semibold text-foreground">{projectedPH.toFixed(1)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Panel title="Timeline Trend Projections" subtitle="12-Month decay & stabilization metrics (scaled)">
            <div className="p-5">
              <MultiLine
                data={chartData}
                xKey="month"
                keys={[
                  { key: "Organic Carbon (%)", color: "var(--color-primary)" },
                  { key: "NPK Health Index", color: "var(--color-chart-2)" },
                  { key: "Soil pH", color: "var(--color-chart-4)" },
                ]}
              />
            </div>
          </Panel>

          <Panel title="AI Forecast Explanations" subtitle="Digital Twin structural reports">
            <div className="p-5">
              <ul className="space-y-3">
                {insights.map((t, idx) => (
                  <li key={idx} className="flex gap-3 rounded-lg border border-border/50 bg-background/50 p-4 transition-all hover:bg-background/80">
                    <div className="bg-primary/10 rounded-md p-1.5 h-fit shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs leading-relaxed text-foreground/90">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
