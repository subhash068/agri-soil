import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { CalendarRange, Sparkles, CloudRain, Sun, Thermometer, Droplets, Info } from "lucide-react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { AreaTrend, Bars } from "@/components/charts/Charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/seasonal-intelligence")({
  head: () => ({ meta: [{ title: "Seasonal Intelligence — AgriSoil AI" }] }),
  component: SeasonalIntelligence,
});

type SeasonType = "Kharif" | "Rabi" | "Zaid";

interface SeasonSpec {
  window: string;
  rainfall: string;
  rainfallTone: "success" | "warning" | "destructive";
  moisture: string;
  moistureDelta: number;
  crops: { name: string; suitability: number; duration: string; practice: string }[];
  chartData: { month: string; Rainfall: number; Temperature: number; Humidity: number }[];
  advisories: string[];
}

const SEASON_DATA: Record<SeasonType, Record<string, SeasonSpec>> = {
  Kharif: {
    NTR: {
      window: "June – July",
      rainfall: "Above Normal (+12%)",
      rainfallTone: "success",
      moisture: "62% (Optimal)",
      moistureDelta: 4.5,
      crops: [
        { name: "Paddy (Rice)", suitability: 92, duration: "135 days", practice: "Direct Seeded Rice (DSR) to save 25% water." },
        { name: "Cotton", suitability: 85, duration: "165 days", practice: "Ridge & furrow sowing to prevent waterlogging." },
        { name: "Red Gram", suitability: 78, duration: "180 days", practice: "Intercrop with Groundnut (1:7 ratio)." },
      ],
      chartData: [
        { month: "Jun", Rainfall: 110, Temperature: 34, Humidity: 65 },
        { month: "Jul", Rainfall: 240, Temperature: 31, Humidity: 78 },
        { month: "Aug", Rainfall: 210, Temperature: 30, Humidity: 82 },
        { month: "Sep", Rainfall: 160, Temperature: 31, Humidity: 80 },
        { month: "Oct", Rainfall: 90, Temperature: 32, Humidity: 70 },
      ],
      advisories: [
        "Sow Paddy nurseries immediately; transplanting should be finished by July 15.",
        "Ensure proper drainage channels in cotton fields to avoid root rot from high rainfall.",
        "Apply pre-emergence herbicide (Pendimethalin) within 48 hours of sowing pulses.",
      ],
    },
    Anantapur: {
      window: "July – August",
      rainfall: "Deficit (-15%)",
      rainfallTone: "destructive",
      moisture: "38% (Low)",
      moistureDelta: -8.2,
      crops: [
        { name: "Groundnut", suitability: 88, duration: "110 days", practice: "Seed treatment with Trichoderma viride." },
        { name: "Bajra (Pearl Millet)", suitability: 82, duration: "90 days", practice: "Sow with moisture conservation conservation furrows." },
        { name: "Castor", suitability: 74, duration: "150 days", practice: "Drought resistant fallback crop." },
      ],
      chartData: [
        { month: "Jun", Rainfall: 40, Temperature: 36, Humidity: 45 },
        { month: "Jul", Rainfall: 70, Temperature: 34, Humidity: 55 },
        { month: "Aug", Rainfall: 90, Temperature: 32, Humidity: 62 },
        { month: "Sep", Rainfall: 80, Temperature: 32, Humidity: 60 },
        { month: "Oct", Rainfall: 50, Temperature: 33, Humidity: 50 },
      ],
      advisories: [
        "Delay sowing groundnut if rainfall is delayed past July 25; keep seed rate higher.",
        "Adopt micro-sprinklers for groundnut during pegging stage to maintain yield.",
        "Mulch open soil beds with crop residues to conserve existing topsoil moisture.",
      ],
    },
  },
  Rabi: {
    NTR: {
      window: "October – November",
      rainfall: "Normal",
      rainfallTone: "success",
      moisture: "52% (Moderate)",
      moistureDelta: 1.2,
      crops: [
        { name: "Black Gram", suitability: 90, duration: "85 days", practice: "Zero tillage sowing immediately after Paddy harvest." },
        { name: "Maize", suitability: 84, duration: "120 days", practice: "Precision drip irrigation recommended." },
        { name: "Bengal Gram", suitability: 76, duration: "95 days", practice: "Treat seeds with Rhizobium culture." },
      ],
      chartData: [
        { month: "Oct", Rainfall: 80, Temperature: 31, Humidity: 65 },
        { month: "Nov", Rainfall: 45, Temperature: 28, Humidity: 60 },
        { month: "Dec", Rainfall: 10, Temperature: 26, Humidity: 55 },
        { month: "Jan", Rainfall: 5, Temperature: 26, Humidity: 52 },
        { month: "Feb", Rainfall: 8, Temperature: 29, Humidity: 50 },
      ],
      advisories: [
        "Utilize residual moisture after rice harvest for quick black gram germination.",
        "Monitor for Spodoptera litura (tobacco caterpillar) in young black gram crops.",
        "Provide critical irrigation at maize flowering stage (55-60 Days after sowing).",
      ],
    },
    Anantapur: {
      window: "October – November",
      rainfall: "Below Normal (-8%)",
      rainfallTone: "warning",
      moisture: "44% (Moderate-Low)",
      moistureDelta: -2.1,
      crops: [
        { name: "Bengal Gram (Chickpea)", suitability: 86, duration: "95 days", practice: "Deep ploughing to lock moisture." },
        { name: "Sorghum (Jowar)", suitability: 80, duration: "110 days", practice: "Low water requirement cereal." },
        { name: "Sunflower", suitability: 72, duration: "100 days", practice: "Ideal for light-medium soils." },
      ],
      chartData: [
        { month: "Oct", Rainfall: 60, Temperature: 32, Humidity: 58 },
        { month: "Nov", Rainfall: 30, Temperature: 29, Humidity: 54 },
        { month: "Dec", Rainfall: 8, Temperature: 27, Humidity: 50 },
        { month: "Jan", Rainfall: 2, Temperature: 27, Humidity: 48 },
        { month: "Feb", Rainfall: 5, Temperature: 30, Humidity: 45 },
      ],
      advisories: [
        "Complete Bengal Gram sowing by mid-November to avoid terminal heat stress.",
        "Apply micro-nutrients foliar spray to boost drought tolerance.",
        "Schedule irrigation at flowering and pod development stages.",
      ],
    },
  },
  Zaid: {
    NTR: {
      window: "March – April",
      rainfall: "Dry / Low",
      rainfallTone: "warning",
      moisture: "35% (Dry)",
      moistureDelta: -4.0,
      crops: [
        { name: "Sesame (Gingelly)", suitability: 85, duration: "80 days", practice: "Requires minimal water, high temperature tolerant." },
        { name: "Green Gram", suitability: 80, duration: "70 days", practice: "Fast growing summer green manure legume." },
        { name: "Watermelon", suitability: 75, duration: "90 days", practice: "Drip irrigation with silver-black mulch sheets." },
      ],
      chartData: [
        { month: "Mar", Rainfall: 12, Temperature: 36, Humidity: 48 },
        { month: "Apr", Rainfall: 15, Temperature: 39, Humidity: 45 },
        { month: "May", Rainfall: 25, Temperature: 42, Humidity: 42 },
      ],
      advisories: [
        "Incorporate green gram residue back into soil after harvest to enrich organic nitrogen.",
        "Adopt drip irrigation exclusively to counter high transpiration evaporation rates.",
        "Perform weeding at 20-25 days after sowing to minimize moisture competition.",
      ],
    },
    Anantapur: {
      window: "March – April",
      rainfall: "Extreme Dry",
      rainfallTone: "destructive",
      moisture: "22% (Severe Deficit)",
      moistureDelta: -12.4,
      crops: [
        { name: "Fodder Sorghum", suitability: 80, duration: "75 days", practice: "Provides vital animal nutrition in summer droughts." },
        { name: "Sesame", suitability: 72, duration: "80 days", practice: "Drought resistant oilseed crop." },
        { name: "Cluster Bean (Guar)", suitability: 70, duration: "90 days", practice: "Extremely hardy legume." },
      ],
      chartData: [
        { month: "Mar", Rainfall: 5, Temperature: 38, Humidity: 35 },
        { month: "Apr", Rainfall: 8, Temperature: 41, Humidity: 30 },
        { month: "May", Rainfall: 15, Temperature: 44, Humidity: 28 },
      ],
      advisories: [
        "Restrict Zaid planting to parcels with assured borewell recharge levels.",
        "Implement rain shelters and soil mulching to conserve water.",
        "Utilize hydrogels in planting pits to boost soil water retention.",
      ],
    },
  },
};

function SeasonalIntelligence() {
  const [district, setDistrict] = useState<string>("NTR");
  const [season, setSeason] = useState<SeasonType>("Kharif");

  // Fallback if data not found
  const districtData = SEASON_DATA[season] || SEASON_DATA.Kharif;
  const spec = districtData[district] || districtData.NTR;

  // Format rainfall forecast icon
  const getRainfallIcon = () => {
    if (spec.rainfallTone === "success") return <CloudRain className="w-4 h-4 text-emerald-400" />;
    if (spec.rainfallTone === "warning") return <Sun className="w-4 h-4 text-amber-400" />;
    return <CloudRain className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CalendarRange className="h-5 w-5" />}
        title="Seasonal Intelligence"
        description="Region-specific climate predictions, crop windows, and proactive irrigation schedules tailored to seasonal changes."
        actions={<Pill tone="success">Season Tracker</Pill>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 animate-in fade-in duration-300">
        <Kpi index={0} label="Active Window" value={spec.window} tone="default" icon={CalendarRange} />
        <Kpi index={1} label="Rainfall Forecast" value={spec.rainfall} tone={spec.rainfallTone} icon={CloudRain} />
        <Kpi index={2} label="Soil Moisture (Avg)" value={spec.moisture} tone={spec.rainfallTone === "destructive" ? "destructive" : "success"} delta={spec.moistureDelta} />
        <Kpi index={3} label="Sowing Status" value="Open" tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <Panel title="Region & Time Filter" subtitle="Configure seasonal tracking">
            <div className="space-y-5 p-5">
              <div className="space-y-2">
                <Label htmlFor="district-select">Select District</Label>
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

              <div className="space-y-2">
                <Label>Cropping Season</Label>
                <Tabs value={season} onValueChange={(val) => setSeason(val as SeasonType)}>
                  <TabsList className="grid grid-cols-3 bg-muted/40">
                    <TabsTrigger value="Kharif" className="text-xs py-1.5">Kharif</TabsTrigger>
                    <TabsTrigger value="Rabi" className="text-xs py-1.5">Rabi</TabsTrigger>
                    <TabsTrigger value="Zaid" className="text-xs py-1.5">Zaid/Summer</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="pt-4 border-t border-border/40 space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold text-foreground">Season Note:</span> {season} is characterized by regional temperatures averaging {season === "Zaid" ? "39°C" : season === "Rabi" ? "28°C" : "32°C"} with distinct rainfall distributions.
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Recommended Crops" subtitle={`Top options for ${season} season`}>
            <div className="p-5 space-y-4">
              {spec.crops.map((c) => (
                <div key={c.name} className="rounded-lg border border-border/50 bg-background/50 p-4 transition-all hover:bg-background/80">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-foreground">{c.name}</span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                      {c.suitability}% Suitability
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">Duration: {c.duration}</p>
                  <p className="text-[11px] leading-relaxed text-foreground/80">{c.practice}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Panel title="Projected Climate Conditions" subtitle="Projected rainfall (mm) vs. Temperature (°C) / Humidity (%)">
            <div className="p-5">
              <Bars
                data={spec.chartData}
                xKey="month"
                keys={[
                  { key: "Rainfall", color: "var(--color-primary)" },
                  { key: "Temperature", color: "var(--color-chart-4)" },
                  { key: "Humidity", color: "var(--color-chart-2)" },
                ]}
                yUnit=""
              />
            </div>
          </Panel>

          <Panel title="Explainable Proactive Advisories" subtitle="Immediate farm operations schedule">
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
      </div>
    </div>
  );
}
