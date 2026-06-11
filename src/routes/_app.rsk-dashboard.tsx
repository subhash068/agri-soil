import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, AlertTriangle, Calendar, MapPin, Search, ChevronRight, CheckCircle2, Info, Plus, Sparkles, Map } from "lucide-react";

const SoilHealthMap = React.lazy(() => import("@/components/maps/SoilHealthMap").then(m => ({ default: m.SoilHealthMap })));

export const Route = createFileRoute("/_app/rsk-dashboard")({
  head: () => ({ meta: [{ title: "RSK Dashboard — AgriSoil AI" }] }),
  component: RskDashboard,
});

const RSK_CENTERS = [
  {
    id: "tadikonda",
    name: "Tadikonda-A (Guntur)",
    assignedFarmers: 1240,
    pendingAdvisories: 86,
    hotspots: 9,
    visitsPlanned: 32,
    insights: [
      "Prioritise 9 zinc-critical hotspots in Tadikonda & Pedakakani.",
      "86 advisories pending farmer acknowledgement — schedule field visits.",
      "Adoption in your RSK is 6.4% above mandal average."
    ],
    farmers: [
      { id: "f1", name: "K. Ramaiah", village: "Tadikonda", crop: "Cotton", health: 61, priority: "High", priorityColor: "text-warning bg-warning/10 border-warning/20", status: "Pending Visit" },
      { id: "f2", name: "M. Venkateswarlu", village: "Tadikonda", crop: "Chilli", health: 48, priority: "Critical", priorityColor: "text-destructive bg-destructive/10 border-destructive/20", status: "Pending Visit" },
      { id: "f3", name: "D. Lakshmi", village: "Pedakakani", crop: "Cotton", health: 74, priority: "Medium", priorityColor: "text-info bg-info/10 border-info/20", status: "Visit Planned" },
      { id: "f4", name: "S. Koti Reddy", village: "Ponur", crop: "Paddy", health: 82, priority: "Low", priorityColor: "text-success bg-success/10 border-success/20", status: "Card Distributed" }
    ],
    hotspotsData: [
      { nutrient: "Zinc (Zn)", count: 28, pct: 45, color: "bg-destructive" },
      { nutrient: "Nitrogen (N)", count: 18, pct: 30, color: "bg-warning" },
      { nutrient: "Organic Carbon (OC)", count: 15, pct: 24, color: "bg-info" },
      { nutrient: "Phosphorus (P)", count: 8, pct: 12, color: "bg-primary" }
    ]
  },
  {
    id: "chandarlapadu",
    name: "Chandarlapadu-1 (NTR)",
    assignedFarmers: 950,
    pendingAdvisories: 42,
    hotspots: 4,
    visitsPlanned: 18,
    insights: [
      "4 phosphorus-critical hotspots identified near Krishna River bank villages.",
      "42 pending advisories — most are paddy farmers undergoing transplanting.",
      "Nitrogen utilization efficiency is high due to silt-based deposits."
    ],
    farmers: [
      { id: "f5", name: "Y. Apparao", village: "Chandarlapadu", crop: "Paddy", health: 78, priority: "Medium", priorityColor: "text-info bg-info/10 border-info/20", status: "Card Distributed" },
      { id: "f6", name: "V. Sambaiah", village: "Chandarlapadu", crop: "Paddy", health: 53, priority: "High", priorityColor: "text-warning bg-warning/10 border-warning/20", status: "Pending Visit" },
      { id: "f7", name: "P. Ranga Rao", village: "Munagapadu", crop: "Sugarcane", health: 65, priority: "Medium", priorityColor: "text-info bg-info/10 border-info/20", status: "Visit Planned" }
    ],
    hotspotsData: [
      { nutrient: "Phosphorus (P)", count: 14, pct: 35, color: "bg-warning" },
      { nutrient: "Potassium (K)", count: 9, pct: 22, color: "bg-info" },
      { nutrient: "Iron (Fe)", count: 6, pct: 15, color: "bg-primary" }
    ]
  },
  {
    id: "dharmavaram",
    name: "Dharmavaram Rural (Anantapur)",
    assignedFarmers: 1510,
    pendingAdvisories: 114,
    hotspots: 15,
    visitsPlanned: 40,
    insights: [
      "Groundwater levels are low (category: semi-critical) - recommend micro-irrigation.",
      "Critical Boron and Sulphur deficiencies found in 15 localized groundnut sectors.",
      "Schedule Gypsum distribution during pegging stage (next 15 days)."
    ],
    farmers: [
      { id: "f8", name: "M. Chennakesavulu", village: "Dharmavaram", crop: "Groundnut", health: 42, priority: "Critical", priorityColor: "text-destructive bg-destructive/10 border-destructive/20", status: "Pending Visit" },
      { id: "f9", name: "G. Obulesu", village: "Dharmavaram", crop: "Groundnut", health: 58, priority: "High", priorityColor: "text-warning bg-warning/10 border-warning/20", status: "Visit Planned" },
      { id: "f10", name: "K. Narayanappa", village: "D. Kothapalli", crop: "Millets", health: 69, priority: "Medium", priorityColor: "text-info bg-info/10 border-info/20", status: "Card Distributed" }
    ],
    hotspotsData: [
      { nutrient: "Boron (B)", count: 34, pct: 55, color: "bg-destructive" },
      { nutrient: "Sulphur (S)", count: 25, pct: 40, color: "bg-warning" },
      { nutrient: "Phosphorus (P)", count: 19, pct: 30, color: "bg-info" }
    ]
  }
];

function RskDashboard() {
  const [selectedRskId, setSelectedRskId] = useState<string>("tadikonda");
  const [searchQuery, setSearchQuery] = useState<string>("Tadikonda");

  // Visit Planner interactive state
  const [targetFarmer, setTargetFarmer] = useState<any>(null);
  const [visitDate, setVisitDate] = useState<string>("2026-06-15");
  const [visitPurpose, setVisitPurpose] = useState<string>("Soil Sampling");
  const [scheduleSuccess, setScheduleSuccess] = useState<string>("");

  const rsk = RSK_CENTERS.find((r) => r.id === selectedRskId) || RSK_CENTERS[0];

  const handleOpenVisitPlanner = (farmer: any) => {
    setTargetFarmer(farmer);
  };

  const handleScheduleVisit = () => {
    if (!targetFarmer) return;

    // Update status in the farmer list locally
    rsk.farmers = rsk.farmers.map((f) => {
      if (f.id === targetFarmer.id) {
        return { ...f, status: "Visit Scheduled" };
      }
      return f;
    });

    rsk.visitsPlanned += 1;
    setScheduleSuccess(`Visit scheduled for ${targetFarmer.name} on ${visitDate}!`);
    setTimeout(() => {
      setScheduleSuccess("");
      setTargetFarmer(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Building2 className="h-5 w-5" />}
        title="RSK Officer Dashboard"
        description="Localized soil analytics, target farmer rosters, nutrient hotspot tracking, and field visit coordination."
        actions={
          <div className="flex items-center gap-2">
            <Select value={selectedRskId} onValueChange={(val) => {
              setSelectedRskId(val);
              setSearchQuery(val === "tadikonda" ? "Tadikonda" : val === "chandarlapadu" ? "Chandarlapadu" : "Dharmavaram");
            }}>
              <SelectTrigger className="w-[240px] bg-background/50 border-border/60">
                <SelectValue placeholder="Select RSK Center" />
              </SelectTrigger>
              <SelectContent>
                {RSK_CENTERS.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Pill tone="info">Rythu Bharosa Kendram</Pill>
          </div>
        }
      />

      {/* KPI Panel */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 animate-in fade-in duration-300">
        <Kpi index={0} label="Assigned Farmers" value={rsk.assignedFarmers.toLocaleString()} icon={Users} tone="info" />
        <Kpi index={1} label="Pending Advisories" value={rsk.pendingAdvisories.toString()} icon={AlertTriangle} tone="warning" />
        <Kpi index={2} label="Critical Hotspots" value={rsk.hotspots.toString()} icon={AlertTriangle} tone="destructive" />
        <Kpi index={3} label="Field Visits Planned" value={rsk.visitsPlanned.toString()} icon={Calendar} tone="success" />
      </div>

      {/* Main Panel layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Farmer list and Visit planner */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Assigned Farmer Roster" subtitle="Real-time farmer status and priority advisory tracking">
            <div className="p-4 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                      <th className="pb-2">Farmer Name</th>
                      <th className="pb-2">Village</th>
                      <th className="pb-2">Active Crop</th>
                      <th className="pb-2 text-center">Soil Index</th>
                      <th className="pb-2 text-center">Advisory Priority</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-foreground/90 font-medium">
                    {rsk.farmers.map((f) => (
                      <tr key={f.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3 font-bold text-foreground">{f.name}</td>
                        <td className="py-3 text-muted-foreground">{f.village}</td>
                        <td className="py-3">{f.crop}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            f.health >= 80 ? "bg-success/15 text-success" : f.health >= 60 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                          }`}>
                            {f.health}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${f.priorityColor}`}>
                            {f.priority}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {f.status === "Card Distributed" ? (
                            <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">Distributed</span>
                          ) : f.status === "Visit Scheduled" ? (
                            <span className="text-[10px] text-success bg-success/15 border border-success/25 px-2 py-0.5 rounded">Scheduled</span>
                          ) : (
                            <Button
                              onClick={() => handleOpenVisitPlanner(f)}
                              variant="outline"
                              className="h-6 text-[10px] px-2 font-bold"
                            >
                              Schedule
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>

          {/* Visit Planner Interactive Form */}
          {targetFarmer && (
            <Panel title="Schedule Field Visit" subtitle={`Configure field advisory parameters for ${targetFarmer.name}`} className="animate-in slide-in-from-top-1 duration-200">
              <div className="p-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="visit-date">Visit Date</Label>
                    <Input
                      type="date"
                      id="visit-date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="bg-background/50 border-border/60 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="visit-purpose">Purpose of Visit</Label>
                    <Select value={visitPurpose} onValueChange={setVisitPurpose}>
                      <SelectTrigger id="visit-purpose" className="bg-background/50 border-border/60">
                        <SelectValue placeholder="Select Purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Soil Sampling">Soil Sampling</SelectItem>
                        <SelectItem value="Zinc Deficiency Follow-up">Zinc Deficiency Follow-up</SelectItem>
                        <SelectItem value="Gypsum Application Guidance">Gypsum Application Guidance</SelectItem>
                        <SelectItem value="Adoption Verification">Adoption Verification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 items-end">
                    <Button onClick={handleScheduleVisit} className="flex-1 text-xs font-semibold gap-1.5">
                      Confirm Visit
                    </Button>
                    <Button onClick={() => setTargetFarmer(null)} variant="outline" className="text-xs font-semibold">
                      Cancel
                    </Button>
                  </div>
                </div>

                {scheduleSuccess && (
                  <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 flex gap-2 items-center text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{scheduleSuccess}</span>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* Soil Map Panel */}
          <Panel title="RSK Boundary Soil Map" subtitle="Spatial view of local administrative segments">
            <div className="p-4 relative">
              <React.Suspense fallback={<div className="h-[380px] bg-muted/20 animate-pulse rounded border border-border flex items-center justify-center text-xs text-muted-foreground">Loading interactive GIS Soil Map...</div>}>
                <SoilHealthMap metricKey="adoption" height={380} />
              </React.Suspense>
            </div>
          </Panel>
        </div>

        {/* Right Side: Hotspots, adoption rate, insights */}
        <div className="lg:col-span-1 space-y-6">
          <Panel title="RSK Insights & Advisory Tasks" subtitle="Dynamic targets for this week">
            <div className="p-5 space-y-4">
              {rsk.insights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 p-3.5 rounded-lg border border-border/40 bg-background/30 hover:bg-muted/10 transition-colors">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-muted-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Nutrient Deficiency Hotspots" subtitle="Critical nutrient deficiency counts in your RSK">
            <div className="p-5 space-y-4">
              {rsk.hotspotsData.map((data, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">{data.nutrient}</span>
                    <span className="text-muted-foreground">{data.count} sectors ({data.pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${data.color}`} style={{ width: `${data.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
