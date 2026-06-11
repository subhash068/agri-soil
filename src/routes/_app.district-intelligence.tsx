import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPinned, Users, CheckCircle, BarChart3, TrendingUp, AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";

const SoilHealthMap = React.lazy(() => import("@/components/maps/SoilHealthMap").then(m => ({ default: m.SoilHealthMap })));

export const Route = createFileRoute("/_app/district-intelligence")({
  head: () => ({ meta: [{ title: "District Intelligence — AgriSoil AI" }] }),
  component: DistrictIntelligence,
});

const DISTRICT_PROFILES = [
  {
    id: "guntur",
    name: "Guntur",
    soilHealth: 68,
    primaryCrop: "Cotton & Chillies",
    organicCarbon: "0.42% (Low)",
    criticalDeficiency: "Zinc (Zn)",
    adoptionRate: 69,
    cardsTarget: 185000,
    cardsDistributed: 155000,
    rskCount: 420,
    actionPlan: {
      budget: "₹4.2 Crores",
      focus: "Zinc Sulphate distribution for black soil cotton tracts.",
      timeline: "Before Rabi sowing (July 2026)",
      remediationTarget: "12,400 farmers in Tadikonda, Pedakakani"
    }
  },
  {
    id: "ntr",
    name: "NTR",
    soilHealth: 72,
    primaryCrop: "Paddy & Sugarcane",
    organicCarbon: "0.58% (Medium)",
    criticalDeficiency: "Phosphorus (P)",
    adoptionRate: 78,
    cardsTarget: 200000,
    cardsDistributed: 180000,
    rskCount: 380,
    actionPlan: {
      budget: "₹3.8 Crores",
      focus: "Phosphorus management & split Nitrogen urea advisories.",
      timeline: "Immediate basal dose monitoring (June 2026)",
      remediationTarget: "9,900 farmers in Chandarlapadu, Nandigama"
    }
  },
  {
    id: "anantapur",
    name: "Anantapur",
    soilHealth: 46,
    primaryCrop: "Groundnut & Millets",
    organicCarbon: "0.28% (Very Low)",
    criticalDeficiency: "Boron (B) & Sulphur (S)",
    adoptionRate: 54,
    cardsTarget: 220000,
    cardsDistributed: 120000,
    rskCount: 510,
    actionPlan: {
      budget: "₹6.5 Crores",
      focus: "Gypsum & micro-nutrient packs (Borax) with drought mitigation advice.",
      timeline: "Before Groundnut sowing (June 2026)",
      remediationTarget: "15,200 farmers in Dharmavaram rural, Kalyanadurg"
    }
  }
];

function DistrictIntelligence() {
  const [primaryDistrictId, setPrimaryDistrictId] = useState<string>("anantapur");
  const [compareDistrictId, setCompareDistrictId] = useState<string>("guntur");
  const [actionGenerated, setActionGenerated] = useState<boolean>(false);

  const primary = DISTRICT_PROFILES.find((d) => d.id === primaryDistrictId) || DISTRICT_PROFILES[0];
  const compare = DISTRICT_PROFILES.find((d) => d.id === compareDistrictId) || DISTRICT_PROFILES[1];

  const handleGenerateActionPlan = () => {
    setActionGenerated(true);
    setTimeout(() => {
      setActionGenerated(false);
    }, 8000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<MapPinned className="h-5 w-5" />}
        title="District Soil Intelligence"
        description="Side-by-side district comparisons, administrative soil health card progress, and region-level agricultural action planners."
        actions={<Pill tone="success">Active comparison mode</Pill>}
      />

      {/* Comparison Pickers */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-border bg-card/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">Compare District A:</span>
          <Select value={primaryDistrictId} onValueChange={setPrimaryDistrictId}>
            <SelectTrigger className="w-[180px] bg-background/50 border-border/60 text-xs">
              <SelectValue placeholder="District A" />
            </SelectTrigger>
            <SelectContent>
              {DISTRICT_PROFILES.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground font-bold font-mono">VS</div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">District B:</span>
          <Select value={compareDistrictId} onValueChange={setCompareDistrictId}>
            <SelectTrigger className="w-[180px] bg-background/50 border-border/60 text-xs">
              <SelectValue placeholder="District B" />
            </SelectTrigger>
            <SelectContent>
              {DISTRICT_PROFILES.map((d) => (
                <SelectItem key={d.id} value={d.id} disabled={d.id === primaryDistrictId}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* KPI: Composite Soil Health comparison */}
        <Panel title="Soil Health Index (SHI)" subtitle="Scale of 1-100 (composite chemical indices)">
          <div className="p-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{primary.name}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] ${
                  primary.soilHealth >= 70 ? "bg-success/15 text-success" : primary.soilHealth >= 60 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                }`}>{primary.soilHealth}/100</span>
              </div>
              <div className="h-3.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${
                  primary.soilHealth >= 70 ? "bg-success" : primary.soilHealth >= 60 ? "bg-warning" : "bg-destructive"
                }`} style={{ width: `${primary.soilHealth}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{compare.name}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] ${
                  compare.soilHealth >= 70 ? "bg-success/15 text-success" : compare.soilHealth >= 60 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                }`}>{compare.soilHealth}/100</span>
              </div>
              <div className="h-3.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${
                  compare.soilHealth >= 70 ? "bg-success" : compare.soilHealth >= 60 ? "bg-warning" : "bg-destructive"
                }`} style={{ width: `${compare.soilHealth}%` }} />
              </div>
            </div>
          </div>
        </Panel>

        {/* KPI: Card Distribution progress */}
        <Panel title="Soil Health Cards Distributed" subtitle="Issued cards against target goals">
          <div className="p-5 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{primary.name}</span>
                <span>{primary.cardsDistributed.toLocaleString()} / {primary.cardsTarget.toLocaleString()} ({Math.round(primary.cardsDistributed/primary.cardsTarget*100)}%)</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.round(primary.cardsDistributed/primary.cardsTarget*100)}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{compare.name}</span>
                <span>{compare.cardsDistributed.toLocaleString()} / {compare.cardsTarget.toLocaleString()} ({Math.round(compare.cardsDistributed/compare.cardsTarget*100)}%)</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-info" style={{ width: `${Math.round(compare.cardsDistributed/compare.cardsTarget*100)}%` }} />
              </div>
            </div>
          </div>
        </Panel>

        {/* KPI: Adoption Rate comparison */}
        <Panel title="Advisory Adoption Rate" subtitle="Percentage of farmers implementing remediation advice">
          <div className="p-5 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{primary.name}</span>
                <span>{primary.adoptionRate}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${primary.adoptionRate}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{compare.name}</span>
                <span>{compare.adoptionRate}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${compare.adoptionRate}%` }} />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Detail Comparative Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Structural Profile Comparison" subtitle={`Side-by-side telemetry for ${primary.name} vs ${compare.name}`}>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="pb-2">Metric Type</th>
                    <th className="pb-2">{primary.name}</th>
                    <th className="pb-2">{compare.name}</th>
                    <th className="pb-2 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-foreground/90 font-medium">
                  <tr>
                    <td className="py-3 font-bold">Active Crop</td>
                    <td className="py-3">{primary.primaryCrop}</td>
                    <td className="py-3">{compare.primaryCrop}</td>
                    <td className="py-3 text-right text-muted-foreground">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Soil Health Score</td>
                    <td className="py-3">{primary.soilHealth}/100</td>
                    <td className="py-3">{compare.soilHealth}/100</td>
                    <td className="py-3 text-right font-bold text-destructive">-{Math.abs(primary.soilHealth - compare.soilHealth)} pts</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Organic Carbon (OC)</td>
                    <td className="py-3">{primary.organicCarbon}</td>
                    <td className="py-3">{compare.organicCarbon}</td>
                    <td className="py-3 text-right text-muted-foreground">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Critical Deficiency</td>
                    <td className="py-3 text-destructive font-semibold">{primary.criticalDeficiency}</td>
                    <td className="py-3 text-destructive font-semibold">{compare.criticalDeficiency}</td>
                    <td className="py-3 text-right text-muted-foreground">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Adoption Rate</td>
                    <td className="py-3">{primary.adoptionRate}%</td>
                    <td className="py-3">{compare.adoptionRate}%</td>
                    <td className="py-3 text-right font-bold text-destructive">-{Math.abs(primary.adoptionRate - compare.adoptionRate)}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">RSK Centers</td>
                    <td className="py-3">{primary.rskCount}</td>
                    <td className="py-3">{compare.rskCount}</td>
                    <td className="py-3 text-right font-bold text-success">+{Math.abs(primary.rskCount - compare.rskCount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Map Boundary display */}
          <Panel title="Geospatial Boundaries" subtitle="District-level heatmap rendering">
            <div className="p-4 relative">
              <React.Suspense fallback={<div className="h-[380px] bg-muted/20 animate-pulse rounded border border-border flex items-center justify-center text-xs text-muted-foreground">Loading interactive GIS Soil Map...</div>}>
                <SoilHealthMap metricKey="soilHealth" height={380} />
              </React.Suspense>
            </div>
          </Panel>
        </div>

        {/* Right Side: Action Planner */}
        <div className="lg:col-span-1 space-y-6">
          <Panel title="Action Plan Generator" subtitle={`AI Remediation Blueprint for ${primary.name}`}>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">Target District</span>
                <p className="text-sm font-bold text-foreground">{primary.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">Estimated Budget</span>
                <p className="text-sm font-bold text-primary">{primary.actionPlan.budget}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">Target Farmers</span>
                <p className="text-xs text-foreground/90 leading-relaxed font-semibold">{primary.actionPlan.remediationTarget}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">Focus Plan</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{primary.actionPlan.focus}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">Action Timeline</span>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{primary.actionPlan.timeline}</p>
              </div>

              {actionGenerated ? (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-2 animate-in slide-in-from-top-1 duration-200">
                  <div className="flex gap-2 items-center text-xs font-bold text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>Plan Generated & Dispatched</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Soil health card distribution instructions and fertilizer logistics have been forwarded to {primary.rskCount} RSK centers in {primary.name}.
                  </p>
                </div>
              ) : (
                <Button onClick={handleGenerateActionPlan} className="w-full text-xs font-bold gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate RSK Action Directives
                </Button>
              )}
            </div>
          </Panel>

          {/* Regional alert summaries */}
          <Panel title="Regional Soil Alert Center" subtitle="Real-time alerts flagged per district selection">
            <div className="p-5 space-y-4">
              <div className="flex gap-3 p-3.5 rounded-lg border border-destructive/20 bg-destructive/10">
                <ShieldAlert className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-destructive">Severe Water Stress & Organic Carbon Low</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Anantapur shows continuous dry spells combined with soil pH alkalinity. Urgent organic carbon addition needed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3.5 rounded-lg border border-warning/20 bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-warning">Zinc Deficiency Warning</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Guntur black cotton soil has critical Zinc deficiency. High threat to crop squaring in cotton.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
