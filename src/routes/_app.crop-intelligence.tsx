import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { Bars } from "@/components/charts/Charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, Calendar, Droplet, ShieldAlert, Sparkles, TrendingUp, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/_app/crop-intelligence")({
  head: () => ({ meta: [{ title: "Crop Intelligence — AgriSoil AI" }] }),
  component: CropIntelligence,
});

interface StageDetail {
  name: string;
  days: string;
  water: string;
  fertilizer: string;
  pests: string;
}

interface CropDetail {
  name: string;
  season: string;
  duration: string;
  waterReq: string;
  n: number;
  p: number;
  k: number;
  stages: StageDetail[];
}

const CROP_DATA: Record<string, CropDetail> = {
  Paddy: {
    name: "Paddy (Rice)",
    season: "Kharif",
    duration: "135 Days",
    waterReq: "High (1200 - 1500 mm)",
    n: 120,
    p: 60,
    k: 60,
    stages: [
      { name: "Nursery", days: "Day 1 - 20", water: "Shallow standing water (2 cm)", fertilizer: "Basal NPK (10:10:10)", pests: "Thrips & Gall Midge" },
      { name: "Tillering", days: "Day 21 - 45", water: "Maintain 3-5 cm submergence", fertilizer: "1st split of Urea (top dress)", pests: "Stem Borer & Leaf Folder" },
      { name: "Panicle", days: "Day 46 - 85", water: "Continuous flooding critical", fertilizer: "2nd split of Urea + MOP Potash", pests: "Stem Borer & Blast Disease" },
      { name: "Grain Fill", days: "Day 86 - 115", water: "Keep soil saturated, no flooding", fertilizer: "Foliar spray of Potassium Nitrate", pests: "Brown Plant Hopper (BPH)" },
      { name: "Maturity", days: "Day 116 - 135", water: "Drain field 10 days before harvest", fertilizer: "No fertilizer needed", pests: "Bird damage / grain discoloration" },
    ],
  },
  Cotton: {
    name: "Cotton",
    season: "Kharif",
    duration: "165 Days",
    waterReq: "Moderate (700 - 900 mm)",
    n: 150,
    p: 75,
    k: 75,
    stages: [
      { name: "Sowing", days: "Day 1 - 15", water: "Presowing heavy irrigation", fertilizer: "Basal dressing of DAP", pests: "Soil grubs & seedling rot" },
      { name: "Squaring", days: "Day 16 - 45", water: "Alternate furrow irrigation", fertilizer: "First nitrogen side dress", pests: "Aphids, Jassids & Thrips" },
      { name: "Flowering", days: "Day 46 - 90", water: "Critical moisture — do not stress", fertilizer: "Foliar Boron + Potash top-dress", pests: "Pink Bollworm & Whitefly" },
      { name: "Boll Dev", days: "Day 91 - 130", water: "Light irrigation at 12-day intervals", fertilizer: "Second nitrogen split", pests: "Boll Rot & Spotted Bollworm" },
      { name: "Maturity", days: "Day 131 - 165", water: "Terminate irrigation to allow picking", fertilizer: "No fertilizer", pests: "Late sucking pests" },
    ],
  },
  Groundnut: {
    name: "Groundnut",
    season: "Rabi",
    duration: "110 Days",
    waterReq: "Low-Moderate (500 - 650 mm)",
    n: 25,
    p: 50,
    k: 75,
    stages: [
      { name: "Sowing", days: "Day 1 - 15", water: "Light sprinkler/irrigation", fertilizer: "Basal NPK + Single Super Phosphate", pests: "Root Grub & Termites" },
      { name: "Pegging", days: "Day 16 - 45", water: "Critical pegging moisture needed", fertilizer: "Gypsum (500 kg/ha) at pegging", pests: "Leaf Miner & Aphids" },
      { name: "Pod Dev", days: "Day 46 - 85", water: "Moderate soil moisture", fertilizer: "Foliar Calcium spray", pests: "Rust & Late Leaf Spot" },
      { name: "Maturity", days: "Day 86 - 110", water: "Maintain dry topsoil for harvest", fertilizer: "No fertilizer", pests: "Pod Rot & storage pests" },
    ],
  },
  "Red Gram": {
    name: "Red Gram (Pigeonpea)",
    season: "Kharif",
    duration: "180 Days",
    waterReq: "Low (600 - 750 mm)",
    n: 20,
    p: 50,
    k: 40,
    stages: [
      { name: "Sowing", days: "Day 1 - 15", water: "Pre-sowing irrigation if dry", fertilizer: "Basal DAP with Rhizobium seed treat", pests: "Damping off & leaf hoppers" },
      { name: "Branching", days: "Day 16 - 55", water: "Rainfed / dry-spell irrigation", fertilizer: "Light sulphur application", pests: "Blister beetles" },
      { name: "Flowering", days: "Day 56 - 110", water: "Critical flowering moisture", fertilizer: "Foliar urea split", pests: "Pod Borer (Helicoverpa)" },
      { name: "Pod Fill", days: "Day 111 - 150", water: "Moderate watering", fertilizer: "Foliar potassium sulphate", pests: "Pod Fly & Plume Moth" },
      { name: "Maturity", days: "Day 151 - 180", water: "Terminate watering", fertilizer: "No fertilizer", pests: "Dry pod bugs" },
    ],
  },
};

function CropIntelligence() {
  const [activeCrop, setActiveCrop] = useState<string>("Paddy");
  const [activeStageIdx, setActiveStageIdx] = useState<number>(1); // default to Tillering/Squaring/etc

  const crop = CROP_DATA[activeCrop] || CROP_DATA.Paddy;
  const activeStage = crop.stages[activeStageIdx] || crop.stages[0];

  // NPK requirement chart data
  const chartData = [
    { nutrient: "Nitrogen (N)", "Target Requirement": crop.n },
    { nutrient: "Phosphorus (P)", "Target Requirement": crop.p },
    { nutrient: "Potassium (K)", "Target Requirement": crop.k },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Sprout className="h-5 w-5" />}
        title="Crop Intelligence"
        description="Explore optimal crop growth lifecycles, nutrient absorption schedules, and physiological stage advisories."
        actions={<Pill tone="info">Lifecycle Tracker</Pill>}
      />

      <div className="flex gap-2 border-b border-border/40 pb-2">
        {Object.keys(CROP_DATA).map((name) => (
          <button
            key={name}
            onClick={() => {
              setActiveCrop(name);
              setActiveStageIdx(1); // reset to first/second stage
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold border transition-all ${
              activeCrop === name
                ? "bg-primary border-primary/50 text-primary-foreground shadow-sm"
                : "bg-background/50 border-border/50 text-muted-foreground hover:bg-background/80"
            }`}
          >
            {CROP_DATA[name].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 animate-in fade-in duration-300">
        <Kpi index={0} label="Typical Duration" value={crop.duration} tone="default" icon={Calendar} />
        <Kpi index={1} label="Water Requirement" value={crop.waterReq} tone="info" icon={Droplet} />
        <Kpi index={2} label="Cropping Season" value={crop.season} tone="success" />
        <Kpi index={3} label="NPK Ratio" value={`${crop.n}:${crop.p}:${crop.k}`} tone="success" icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <Panel title="NPK Target Proportions" subtitle="Required crop uptake rates (kg/ha)">
            <div className="p-5">
              <Bars
                data={chartData}
                xKey="nutrient"
                keys={[{ key: "Target Requirement", color: "var(--color-primary)" }]}
                yUnit="kg/ha"
              />
            </div>
          </Panel>

          <Panel title="Physiological Warnings" subtitle="Agronomist risk check">
            <div className="p-5">
              <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-warning">Critical Stage Moisture Stress</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    In {crop.name}, moisture stress during the <span className="font-semibold text-foreground">{crop.stages[2].name}</span> stage causes up to 40% yield drop that cannot be recovered by later watering. Prioritize irrigation scheduling.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Panel title="Growth Lifecycle Timeline" subtitle="Click on any stage to inspect requirements">
            <div className="p-5 space-y-6">
              <div className="relative flex justify-between items-center pt-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/40 -translate-y-1/2 z-0" />
                {crop.stages.map((s, idx) => {
                  const isActive = idx === activeStageIdx;
                  return (
                    <button
                      key={s.name}
                      onClick={() => setActiveStageIdx(idx)}
                      className={`relative z-10 h-8 px-3 rounded-full border text-[11px] font-semibold transition-all ${
                        isActive
                          ? "bg-primary border-primary text-primary-foreground shadow-sm scale-110"
                          : "bg-background border-border/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-border/50 bg-background/50 p-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="font-bold text-sm text-foreground">{activeStage.name} Phase</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                    {activeStage.days}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase tracking-wider">Watering Needs</span>
                    <span className="text-xs text-foreground/90 font-medium flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      {activeStage.water}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase tracking-wider">Fertilizer Application</span>
                    <span className="text-xs text-foreground/90 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                      {activeStage.fertilizer}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase tracking-wider">Pest / Disease Watch</span>
                    <span className="text-xs text-foreground/90 font-medium flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-warning shrink-0" />
                      {activeStage.pests}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Stage Explanations" subtitle={`Physiological focus for ${activeStage.name} phase`}>
            <div className="p-5">
              <ul className="space-y-3">
                <li className="flex gap-3 rounded-lg border border-border/50 bg-background/50 p-4 transition-all hover:bg-background/80">
                  <div className="bg-primary/10 rounded-md p-1.5 h-fit shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs leading-relaxed text-foreground/90">
                    {activeStageIdx === 0
                      ? "Focus is on establishing strong seed emergence and nursery health. Heavy root cell division requires highly soluble phosphates."
                      : activeStageIdx === 1
                      ? "Focus shifts to lateral branch node generation. Adequate nitrogen top dressing triggers active shoot elongation."
                      : activeStageIdx === 2
                      ? "High physiological conversion. Cell division during flowering is highly sensitive to zinc and boron deficiencies."
                      : activeStageIdx === 3
                      ? "Dry matter synthesis. Potassium controls stomatal opening, optimizing photosynthesis and starch fill inside grains."
                      : "Harvest moisture levels. High humidity or waterlogging causes seed discoloration and reduces grain test weight."}
                  </span>
                </li>
              </ul>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
