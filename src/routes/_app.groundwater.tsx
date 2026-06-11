import { createFileRoute } from "@tanstack/react-router";
import React, { useState, Suspense } from "react";
import { Droplets, CloudRain, ShieldAlert, Sparkles, TrendingDown, HelpCircle, Activity, Info, Map } from "lucide-react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { AreaTrend } from "@/components/charts/Charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ClientOnly } from "@/components/ClientOnly";

const SoilHealthMap = React.lazy(() => import("@/components/maps/SoilHealthMap").then(m => ({ default: m.SoilHealthMap })));

export const Route = createFileRoute("/_app/groundwater")({
  head: () => ({ meta: [{ title: "Groundwater Intelligence — AgriSoil AI" }] }),
  component: GroundwaterIntelligence,
});

interface DistrictWaterSpec {
  tableDepth: string;
  tableVal: number;
  recharge: string;
  rechargeTone: "success" | "warning" | "destructive";
  borewells: string;
  stress: string;
  stressTone: "success" | "warning" | "destructive";
  trendData: { month: string; Depth: number; Target: number }[];
  advisories: string[];
}

const WATER_DATA: Record<string, DistrictWaterSpec> = {
  NTR: {
    tableDepth: "8.2 m",
    tableVal: 8.2,
    recharge: "Surplus (+1.5%)",
    rechargeTone: "success",
    borewells: "480 Active",
    stress: "Low (Safe)",
    stressTone: "success",
    trendData: [
      { month: "Jan", Depth: 8.5, Target: 9.0 },
      { month: "Mar", Depth: 9.2, Target: 9.0 },
      { month: "May", Depth: 10.1, Target: 9.0 },
      { month: "Jul", Depth: 8.0, Target: 9.0 },
      { month: "Sep", Depth: 7.2, Target: 9.0 },
      { month: "Nov", Depth: 8.1, Target: 9.0 },
    ],
    advisories: [
      "Stable groundwater levels support standard paddy-cotton rotations.",
      "Maintain existing rainwater harvesting farm ponds in all NTR mandals.",
      "Monitor summer draft to prevent localized water logging in low-lying zones.",
    ],
  },
  Anantapur: {
    tableDepth: "28.6 m",
    tableVal: 28.6,
    recharge: "Deficit (-5.4%)",
    rechargeTone: "destructive",
    borewells: "3,140 Active",
    stress: "Severe (Critical)",
    stressTone: "destructive",
    trendData: [
      { month: "Jan", Depth: 26.5, Target: 20.0 },
      { month: "Mar", Depth: 28.2, Target: 20.0 },
      { month: "May", Depth: 31.4, Target: 20.0 },
      { month: "Jul", Depth: 30.1, Target: 20.0 },
      { month: "Sep", Depth: 29.0, Target: 20.0 },
      { month: "Nov", Depth: 27.8, Target: 20.0 },
    ],
    advisories: [
      "Strictly ban flood irrigation. Mandatory shift to micro-sprinklers.",
      "Execute community borewell sharing agreements to manage seasonal drafts.",
      "Accelerate artificial recharge shaft construction in village tanks.",
    ],
  },
};

function GroundwaterIntelligence() {
  const [district, setDistrict] = useState<string>("NTR");
  const spec = WATER_DATA[district] || WATER_DATA.NTR;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Droplets className="h-5 w-5" />}
        title="Groundwater Intelligence"
        description="Monitor seasonal water table depths, recharge stats, borewell density and regional groundwater stress indices."
        actions={<Pill tone="info">Water Resource Index</Pill>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 animate-in fade-in duration-300">
        <Kpi index={0} label="Avg Water Table" value={spec.tableDepth} tone={spec.tableVal > 15 ? "destructive" : "success"} icon={Droplets} />
        <Kpi index={1} label="Recharge Rate" value={spec.recharge} tone={spec.rechargeTone} icon={CloudRain} />
        <Kpi index={2} label="Stress Index" value={spec.stress} tone={spec.stressTone} icon={Activity} />
        <Kpi index={3} label="Borewell Count" value={spec.borewells} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <Panel title="Select Region" subtitle="Inspect local water table records">
            <div className="space-y-5 p-5">
              <div className="space-y-2">
                <Label htmlFor="district-select">District Profile</Label>
                <Select value={district} onValueChange={(val) => setDistrict(val)}>
                  <SelectTrigger id="district-select" className="w-full bg-background/50 border-border/60">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NTR">NTR District</SelectItem>
                    <SelectItem value="Anantapur">Anantapur District</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-border/40 space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold text-foreground">Groundwater Note:</span> In Andhra Pradesh, critical aquifers require artificial recharging when seasonal drop exceeding 1.5m occurs consecutively.
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Regional Water Advisories" subtitle="Immediate aquifer conservation steps">
            <div className="p-5">
              <ul className="space-y-3">
                {spec.advisories.map((t, idx) => (
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

        <div className="space-y-5 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Water Table Level History" subtitle="Seasonal water table depth (m) — lower depth means closer to surface">
              <div className="p-5">
                <AreaTrend
                  data={spec.trendData}
                  keys={[
                    { key: "Depth", color: "var(--color-primary)" },
                    { key: "Target", color: "var(--color-chart-2)" },
                  ]}
                  yUnit="m"
                />
              </div>
            </Panel>

            <Panel title="Water Stress Map" subtitle="Geospatial aquifer stress indices">
              <div className="relative min-h-[280px]">
                <ClientOnly fallback={<div style={{ height: 280, background: "#0a0a0a" }} className="w-full rounded-lg" />}>
                  <Suspense fallback={<div className="flex h-[280px] items-center justify-center"><Info className="animate-spin" /></div>}>
                    <SoilHealthMap metricKey="groundwaterStress" invert={true} height={280} />
                  </Suspense>
                </ClientOnly>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
