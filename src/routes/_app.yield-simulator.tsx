import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { TrendingUp, Sparkles, Sliders, Play, Check } from "lucide-react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { Gauge } from "@/components/ui-kit/Gauge";
import { MultiLine } from "@/components/charts/Charts";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/yield-simulator")({
  head: () => ({ meta: [{ title: "Yield Impact Simulator — AgriSoil AI" }] }),
  component: YieldSimulator,
});

function YieldSimulator() {
  const [soilType, setSoilType] = useState<string>("Black Soil");
  const [irrigation, setIrrigation] = useState<string>("Canal");
  const [nCorrect, setNCorrect] = useState<number>(30); // 0-100%
  const [pCorrect, setPCorrect] = useState<number>(40);
  const [kCorrect, setKCorrect] = useState<number>(20);
  const [ocCorrect, setOCCorrect] = useState<number>(10);

  // 1. Calculate Base Yield based on Soil and Water
  let baseYield = 30.0;
  if (soilType === "Black Soil") {
    baseYield = irrigation === "Canal" ? 40.0 : irrigation === "Borewell" ? 36.0 : 26.0;
  } else if (soilType === "Red Soil") {
    baseYield = irrigation === "Canal" ? 34.0 : irrigation === "Borewell" ? 31.0 : 21.0;
  } else { // Sandy / Other
    baseYield = irrigation === "Canal" ? 28.0 : irrigation === "Borewell" ? 24.0 : 16.0;
  }

  // 2. Add correction contributions
  const nBonus = (nCorrect / 100) * 7.5;
  const pBonus = (pCorrect / 100) * 5.0;
  const kBonus = (kCorrect / 100) * 4.0;
  const ocBonus = (ocCorrect / 100) * 6.5;

  const predictedYield = baseYield + nBonus + pBonus + kBonus + ocBonus;
  const yieldGainPct = ((predictedYield - baseYield) / baseYield) * 100;

  // 3. Compute Sustainability Index
  // Organic Carbon (ocCorrect) is weighted heavily (40%), NPK are 20% each.
  const sustainabilityIndex = Math.round(
    (nCorrect * 0.2) + (pCorrect * 0.2) + (kCorrect * 0.2) + (ocCorrect * 0.4)
  );

  // 4. Generate multi-year trajectory data
  const chartData = [
    {
      year: "2026",
      "No Intervention": Math.round(baseYield),
      "Chemical Only": Math.round(baseYield + nBonus + pBonus),
      "Balanced AI Plan": Math.round(predictedYield),
    },
    {
      year: "2027",
      "No Intervention": Math.round(baseYield * 0.96),
      "Chemical Only": Math.round((baseYield + nBonus + pBonus) * 1.01),
      "Balanced AI Plan": Math.round(predictedYield * 1.05),
    },
    {
      year: "2028",
      "No Intervention": Math.round(baseYield * 0.92),
      "Chemical Only": Math.round((baseYield + nBonus + pBonus) * 0.98),
      "Balanced AI Plan": Math.round(predictedYield * 1.10),
    },
    {
      year: "2029",
      "No Intervention": Math.round(baseYield * 0.88),
      "Chemical Only": Math.round((baseYield + nBonus + pBonus) * 0.95),
      "Balanced AI Plan": Math.round(predictedYield * 1.12),
    },
    {
      year: "2030",
      "No Intervention": Math.round(baseYield * 0.84),
      "Chemical Only": Math.round((baseYield + nBonus + pBonus) * 0.92),
      "Balanced AI Plan": Math.round(predictedYield * 1.15),
    },
  ];

  const insights = [
    `Nitrogen & Phosphorus adjustments boost vegetative node count, driving a ${yieldGainPct.toFixed(1)}% yield expansion.`,
    `Organic carbon addition increases soil microbial biomass, sustaining nitrogen release and avoiding soil salinity degradation over 5 years.`,
    `Water conservation via micro-irrigation ensures the crop reaches predicted yield potential even during low rainfall weeks.`,
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<TrendingUp className="h-5 w-5" />}
        title="Yield Impact Simulator"
        description="Model yield output, projection tracks, and sustainability indexes by adjusting nutrient amendment inputs."
        actions={<Pill tone="success">Predictive Engine</Pill>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 animate-in fade-in duration-300">
        <Kpi index={0} label="Base Line Yield" value={`${baseYield.toFixed(1)} qtl/ha`} tone="default" />
        <Kpi index={1} label="Predicted Yield" value={`${predictedYield.toFixed(1)} qtl/ha`} tone="success" />
        <Kpi index={2} label="Simulated Gain" value={`+${yieldGainPct.toFixed(1)}%`} tone="success" delta={parseFloat(yieldGainPct.toFixed(1))} />
        <Kpi index={3} label="Sustainability Index" value={`${sustainabilityIndex}/100`} tone={sustainabilityIndex >= 70 ? "success" : sustainabilityIndex >= 40 ? "warning" : "destructive"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <Panel title="Treatment Inputs" subtitle="Adjust soil correction rates">
            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="soil-select" className="text-xs">Soil Type</Label>
                  <Select value={soilType} onValueChange={(val) => setSoilType(val)}>
                    <SelectTrigger id="soil-select" className="h-9 bg-background/50 border-border/60 text-xs">
                      <SelectValue placeholder="Soil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Black Soil">Black Soil</SelectItem>
                      <SelectItem value="Red Soil">Red Soil</SelectItem>
                      <SelectItem value="Sandy Soil">Sandy Soil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="irrig-select" className="text-xs">Irrigation</Label>
                  <Select value={irrigation} onValueChange={(val) => setIrrigation(val)}>
                    <SelectTrigger id="irrig-select" className="h-9 bg-background/50 border-border/60 text-xs">
                      <SelectValue placeholder="Irrigation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Canal">Canal</SelectItem>
                      <SelectItem value="Borewell">Borewell</SelectItem>
                      <SelectItem value="Rainfed">Rainfed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 border-t border-border/40 pt-4">
                <Label className="flex justify-between text-xs">
                  <span>Nitrogen (N) Correction</span>
                  <span className="font-bold text-blue-500">{nCorrect}%</span>
                </Label>
                <Slider min={0} max={100} step={5} value={[nCorrect]} onValueChange={(val) => setNCorrect(val[0])} />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>Phosphorus (P) Correction</span>
                  <span className="font-bold text-purple-500">{pCorrect}%</span>
                </Label>
                <Slider min={0} max={100} step={5} value={[pCorrect]} onValueChange={(val) => setPCorrect(val[0])} />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>Potassium (K) Correction</span>
                  <span className="font-bold text-amber-500">{kCorrect}%</span>
                </Label>
                <Slider min={0} max={100} step={5} value={[kCorrect]} onValueChange={(val) => setKCorrect(val[0])} />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between text-xs">
                  <span>Organic Carbon (OC) Correction</span>
                  <span className="font-bold text-success">{ocCorrect}%</span>
                </Label>
                <Slider min={0} max={100} step={5} value={[ocCorrect]} onValueChange={(val) => setOCCorrect(val[0])} />
              </div>
            </div>
          </Panel>

          <Panel title="Predicted Output" subtitle="Current simulation metrics">
            <div className="p-5 flex flex-col items-center justify-center min-h-[220px]">
              <Gauge
                value={parseFloat(predictedYield.toFixed(1))}
                max={60}
                unit=" qtl/ha"
                label="Predicted Yield"
                color="var(--color-primary)"
              />
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Panel title="Yield Trajectory Forecast" subtitle="5-Year projections across cultivation scenarios (qtl/ha)">
            <div className="p-5">
              <MultiLine
                data={chartData}
                xKey="year"
                keys={[
                  { key: "No Intervention", color: "hsl(0, 70%, 45%)" },
                  { key: "Chemical Only", color: "var(--color-chart-2)" },
                  { key: "Balanced AI Plan", color: "var(--color-primary)" },
                ]}
              />
            </div>
          </Panel>

          <Panel title="Agronomist Simulation Insights" subtitle="Expected physiological effects">
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
