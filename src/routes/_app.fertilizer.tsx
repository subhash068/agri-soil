import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Beaker, Clock, IndianRupee, TrendingUp, AlertTriangle, FileDown, Plus, Trash2, Calendar, ShieldAlert, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/fertilizer")({
  head: () => ({ meta: [{ title: "Fertilizer Recommendation Engine — AgriSoil AI" }] }),
  component: Fertilizer,
});

interface SoilReport {
  n: number;
  p: number;
  k: number;
  ph: number;
  zn: number;
}

interface CropTarget {
  name: string;
  n: number;
  p: number;
  k: number;
  zn: number;
  phMin: number;
  phMax: number;
}

const CROP_TARGETS: Record<string, CropTarget> = {
  Paddy: { name: "Paddy (Rice)", n: 120, p: 60, k: 60, zn: 0.8, phMin: 6.0, phMax: 7.5 },
  Cotton: { name: "Cotton", n: 150, p: 75, k: 75, zn: 0.9, phMin: 6.2, phMax: 8.0 },
  Groundnut: { name: "Groundnut", n: 25, p: 50, k: 75, zn: 0.7, phMin: 6.0, phMax: 7.2 },
  "Red Gram": { name: "Red Gram", n: 20, p: 50, k: 40, zn: 0.6, phMin: 6.5, phMax: 7.5 },
};

function Fertilizer() {
  const [district, setDistrict] = useState<string>("NTR");
  const [crop, setCrop] = useState<string>("Paddy");
  const [season, setSeason] = useState<string>("Kharif");
  const [acreage, setAcreage] = useState<number>(5);

  // Manual Soil Test values
  const [soil, setSoil] = useState<SoilReport>({
    n: 210,  // Deficient: standard AP soils average 180-220
    p: 18,   // Deficient: target is >25
    k: 320,  // Good: target is >280
    ph: 7.4, // Neutral-alkaline
    zn: 0.42 // Critical deficiency
  });

  // Handle auto-populating soil data when district changes (to simulate district-specific soils)
  useEffect(() => {
    if (district === "Anantapur") {
      setSoil({ n: 170, p: 14, k: 250, ph: 7.8, zn: 0.35 });
    } else if (district === "Kurnool") {
      setSoil({ n: 190, p: 16, k: 290, ph: 8.1, zn: 0.39 });
    } else if (district === "East Godavari") {
      setSoil({ n: 240, p: 28, k: 340, ph: 6.2, zn: 0.52 });
    } else {
      setSoil({ n: 210, p: 18, k: 320, ph: 7.4, zn: 0.42 });
    }
  }, [district]);

  const target = CROP_TARGETS[crop] || CROP_TARGETS.Paddy;

  // Run scientific recommendation algorithm
  const recommendations: { name: string; dosage: string; timing: string; cost: number; yieldGain: number; reason: string; stage: string }[] = [];

  // 1. Nitrogen recommendation (via Urea)
  // Urea is 46% N. Standard recommendation if Soil N is low.
  const nDeficit = Math.max(0, target.n - (soil.n * 0.25)); // assuming 25% of soil N is mineralizable
  if (nDeficit > 0) {
    const ureaReq = Math.round(nDeficit / 0.46);
    recommendations.push({
      name: "Urea (46% N)",
      dosage: `${Math.round(ureaReq)} kg/ha`,
      timing: "Split application: 1/3 Basal, 1/3 Active Tillering, 1/3 Panicle Initiation",
      cost: Math.round(ureaReq * (300 / 45)),
      yieldGain: parseFloat((nDeficit * 0.08).toFixed(1)),
      reason: `Soil nitrogen (${soil.n} kg/ha) is low. Urea application supports vegetative development.`,
      stage: "Split (Sowing to 60 Days)"
    });
  }

  // 2. Phosphorus recommendation (via DAP)
  // DAP is 18% N, 46% P.
  const pDeficit = Math.max(0, target.p - soil.p);
  if (pDeficit > 0) {
    const dapReq = Math.round(pDeficit / 0.46);
    recommendations.push({
      name: "DAP (18% N, 46% P₂O₅)",
      dosage: `${Math.round(dapReq)} kg/ha`,
      timing: "Basal dressing — apply during final land preparation",
      cost: Math.round(dapReq * (1350 / 50)),
      yieldGain: parseFloat((pDeficit * 0.12).toFixed(1)),
      reason: `Soil phosphorus (${soil.p} kg/ha) is deficient (target is ${target.p} kg/ha). Promotes root elongation.`,
      stage: "Basal (Sowing)"
    });
  }

  // 3. Potassium recommendation (via MOP / Potash)
  // MOP is 60% K.
  const kDeficit = Math.max(0, target.k - (soil.k * 0.15)); // assuming 15% available potash
  if (kDeficit > 0) {
    const mopReq = Math.round(kDeficit / 0.60);
    recommendations.push({
      name: "MOP (60% K₂O Potash)",
      dosage: `${Math.round(mopReq)} kg/ha`,
      timing: "Split: 50% Basal, 50% Panicle / Flowering stage",
      cost: Math.round(mopReq * (1700 / 50)),
      yieldGain: parseFloat((kDeficit * 0.05).toFixed(1)),
      reason: `Soil potassium (${soil.k} kg/ha) is moderate. Promotes crop resilience and grain filling.`,
      stage: "Split (Sowing & Flowering)"
    });
  }

  // 4. Micronutrient: Zinc (via Zinc Sulphate)
  if (soil.zn < target.zn) {
    recommendations.push({
      name: "Zinc Sulphate (21% Zn)",
      dosage: "25 kg/ha",
      timing: "Basal — apply alongside organic manure",
      cost: 1450,
      yieldGain: 6.8,
      reason: `Critical zinc level (${soil.zn} ppm) is below crop requirements. Prevents leaf bronzing.`,
      stage: "Basal (Sowing)"
    });
  }

  // 5. pH Soil Amendments (Lime for acidic, Gypsum for alkaline)
  if (soil.ph < target.phMin) {
    const limeReq = 1200; // kg/ha fallback
    recommendations.push({
      name: "Agricultural Lime (CaCO₃)",
      dosage: `${limeReq} kg/ha`,
      timing: "Soil Amendment — apply 2 weeks before planting",
      cost: 3200,
      yieldGain: 4.5,
      reason: `Soil is acidic (pH ${soil.ph}). Lime raises pH to make primary nutrients soluble.`,
      stage: "Land Prep"
    });
  } else if (soil.ph > target.phMax) {
    const gypsumReq = 1500;
    recommendations.push({
      name: "Agricultural Gypsum (CaSO₄)",
      dosage: `${gypsumReq} kg/ha`,
      timing: "Soil Amendment — apply before monsoon/first watering",
      cost: 2800,
      yieldGain: 5.0,
      reason: `Soil is alkaline (pH ${soil.ph}). Gypsum helps leach exchangeable sodium and lowers alkalinity.`,
      stage: "Land Prep"
    });
  }

  const totalCostPerAcre = recommendations.reduce((a, r) => a + r.cost, 0);
  const totalCost = totalCostPerAcre * acreage;
  const totalYieldGain = recommendations.reduce((a, r) => a + r.yieldGain, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4 print:p-8 print:bg-white print:text-black">
      <PageHeader
        icon={<Beaker className="h-5 w-5" />}
        title="Fertilizer Recommendation Engine"
        description="Compute precision agricultural chemical application schedules based on soil composition and crop nutrient targets."
        actions={
          <div className="flex gap-2 print:hidden">
            <Button size="sm" variant="outline" className="border-border/60 hover:bg-background/80" onClick={handlePrint}>
              <FileDown className="w-4 h-4 mr-1.5" /> Export PDF
            </Button>
            <Pill tone="success">{crop} · {season} · {district}</Pill>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 animate-in fade-in duration-300 print:grid-cols-4">
        <Kpi index={0} label="Recommended Products" value={`${recommendations.length} Inputs`} tone="default" />
        <Kpi index={1} label="Cost per Acre" value={`₹${Math.round(totalCostPerAcre).toLocaleString("en-IN")}`} tone="default" />
        <Kpi index={2} label="Total Crop Cost" value={`₹${Math.round(totalCost).toLocaleString("en-IN")}`} tone="success" />
        <Kpi index={3} label="Expected Yield Gain" value={`+${totalYieldGain.toFixed(1)}%`} tone="success" icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1 print:hidden">
          <Panel title="Input Settings" subtitle="Configure field conditions">
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="district-select" className="text-xs">District</Label>
                  <Select value={district} onValueChange={(val) => setDistrict(val)}>
                    <SelectTrigger id="district-select" className="h-9 bg-background/50 border-border/60 text-xs">
                      <SelectValue placeholder="District" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NTR">NTR</SelectItem>
                      <SelectItem value="Anantapur">Anantapur</SelectItem>
                      <SelectItem value="Kurnool">Kurnool</SelectItem>
                      <SelectItem value="East Godavari">East Godavari</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="crop-select" className="text-xs">Crop Target</Label>
                  <Select value={crop} onValueChange={(val) => setCrop(val)}>
                    <SelectTrigger id="crop-select" className="h-9 bg-background/50 border-border/60 text-xs">
                      <SelectValue placeholder="Crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paddy">Paddy (Rice)</SelectItem>
                      <SelectItem value="Cotton">Cotton</SelectItem>
                      <SelectItem value="Groundnut">Groundnut</SelectItem>
                      <SelectItem value="Red Gram">Red Gram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="season-select" className="text-xs">Season</Label>
                  <Select value={season} onValueChange={(val) => setSeason(val)}>
                    <SelectTrigger id="season-select" className="h-9 bg-background/50 border-border/60 text-xs">
                      <SelectValue placeholder="Season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kharif">Kharif</SelectItem>
                      <SelectItem value="Rabi">Rabi</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="flex justify-between text-xs">
                    <span>Acreage</span>
                    <span className="font-bold text-primary">{acreage} Acres</span>
                  </Label>
                  <Slider min={1} max={50} step={1} value={[acreage]} onValueChange={(val) => setAcreage(val[0])} className="py-2" />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Soil Chemistry Inputs" subtitle="Set lab values manually">
            <div className="space-y-4 p-5">
              <div className="space-y-1">
                <Label className="flex justify-between text-xs">
                  <span>Nitrogen (N)</span>
                  <span className="font-bold text-blue-400">{soil.n} kg/ha</span>
                </Label>
                <Slider min={100} max={450} step={5} value={[soil.n]} onValueChange={(val) => setSoil(prev => ({ ...prev, n: val[0] }))} />
              </div>

              <div className="space-y-1">
                <Label className="flex justify-between text-xs">
                  <span>Phosphorus (P)</span>
                  <span className="font-bold text-purple-400">{soil.p} kg/ha</span>
                </Label>
                <Slider min={5} max={60} step={1} value={[soil.p]} onValueChange={(val) => setSoil(prev => ({ ...prev, p: val[0] }))} />
              </div>

              <div className="space-y-1">
                <Label className="flex justify-between text-xs">
                  <span>Potassium (K)</span>
                  <span className="font-bold text-amber-400">{soil.k} kg/ha</span>
                </Label>
                <Slider min={150} max={550} step={5} value={[soil.k]} onValueChange={(val) => setSoil(prev => ({ ...prev, k: val[0] }))} />
              </div>

              <div className="space-y-1">
                <Label className="flex justify-between text-xs">
                  <span>Soil pH</span>
                  <span className="font-bold text-teal-400">{soil.ph.toFixed(1)}</span>
                </Label>
                <Slider min={4.5} max={9.0} step={0.1} value={[soil.ph]} onValueChange={(val) => setSoil(prev => ({ ...prev, ph: val[0] }))} />
              </div>

              <div className="space-y-1">
                <Label className="flex justify-between text-xs">
                  <span>Zinc (Zn)</span>
                  <span className="font-bold text-emerald-400">{soil.zn.toFixed(2)} ppm</span>
                </Label>
                <Slider min={0.1} max={2.0} step={0.05} value={[soil.zn]} onValueChange={(val) => setSoil(prev => ({ ...prev, zn: val[0] }))} />
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-2 print:col-span-3">
          <Panel title="Prescription Schedule" subtitle="Sequential nutrient applications">
            <div className="p-5 space-y-4">
              {recommendations.length === 0 ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-medium text-foreground">Soil nutrient balance is perfect!</p>
                  <p className="text-xs text-muted-foreground mt-1">No additional chemical corrections or amendments needed for {crop}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((r, idx) => (
                    <div key={idx} className="rounded-lg border border-border/50 bg-background/50 p-4 transition-all hover:bg-background/80 flex flex-col md:flex-row md:items-start gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-sm text-foreground">{r.name}</span>
                          <span className="rounded bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                            {r.stage}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.reason}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-border/20">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">DOSAGE</span>
                            <span className="font-bold">{r.dosage}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block">TIMING</span>
                            <span className="font-bold flex items-center gap-1"><Clock className="w-3 h-3 text-muted-foreground" /> {r.timing}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block">EST. COST</span>
                            <span className="font-bold text-foreground">₹{r.cost.toLocaleString("en-IN")}/ha</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          {(soil.ph < target.phMin || soil.ph > target.phMax) && (
            <Panel title="Critical Soil Warnings" subtitle="Immediate physiological corrections required">
              <div className="p-5">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-destructive">Severe Soil pH Imbalance Detected</p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      The pH level of <span className="font-semibold text-foreground">{soil.ph.toFixed(1)}</span> falls outside the optimal range for {crop} ({target.phMin} - {target.phMax}). Primary NPK absorption will be locked by up to 30% unless correct chemical amendments (agricultural lime or gypsum) are applied.
                    </p>
                  </div>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
