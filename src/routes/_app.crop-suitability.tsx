import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { GeographicFilter } from "@/components/GeographicFilter";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Target, Sparkles, Droplets, Scale, Tractor, Sliders, CheckCircle2, ChevronRight, HelpCircle, RefreshCw } from "lucide-react";

const APMap = React.lazy(() => import("@/components/maps/CropMap").then(m => ({ default: m.CropMap })));

export const Route = createFileRoute("/_app/crop-suitability")({
  head: () => ({ meta: [{ title: "Crop Suitability Engine — AgriSoil AI" }] }),
  component: CropSuitability,
});

const DEFAULT_CROPS = [
  {
    id: "paddy",
    nameEn: "Paddy (Rice)",
    nameTe: "వరి (Paddy)",
    season: "Kharif",
    reqN: 120,
    reqP: 60,
    reqK: 60,
    reqPh: 6.5,
    reqWater: 1250,
    defaultYield: 5.5,
    soilTypeFit: ["Clay", "Loamy", "Alluvial"],
    stages: ["Nursery", "Tillering", "Panicle", "Grain Fill"],
    implements: ["Cage wheels", "Puddlers", "Seed drills"],
    baseReasonEn: "Requires high water retaining capacity and optimal Nitrogen levels.",
    baseReasonTe: "అధిక నీటి నిల్వ సామర్థ్యం మరియు సరైన నత్రజని స్థాయిలు అవసరం."
  },
  {
    id: "cotton",
    nameEn: "Cotton",
    nameTe: "ప్రత్తి (Cotton)",
    season: "Kharif",
    reqN: 150,
    reqP: 75,
    reqK: 75,
    reqPh: 7.5,
    reqWater: 700,
    defaultYield: 2.3,
    soilTypeFit: ["Black", "Loamy"],
    stages: ["Sowing", "Squaring", "Flowering", "Boll Development"],
    implements: ["Disc ploughs", "Tractor-mounted seed drills"],
    baseReasonEn: "Excellent match for deep black soils with good internal drainage.",
    baseReasonTe: "మంచి అంతర్గత పారుదల ఉన్న లోతైన నల్ల రేగడి నేలలకు అద్భుతమైన సరిపోలిక."
  },
  {
    id: "groundnut",
    nameEn: "Groundnut",
    nameTe: "వేరుశనగ (Groundnut)",
    season: "Rabi",
    reqN: 25,
    reqP: 50,
    reqK: 75,
    reqPh: 6.0,
    reqWater: 500,
    defaultYield: 2.5,
    soilTypeFit: ["Red", "Loamy", "Sandy"],
    stages: ["Sowing", "Pegging", "Pod Development", "Maturity"],
    implements: ["MB Ploughs", "Seed-cum-fertilizer drills"],
    baseReasonEn: "Thrives in well-drained sandy loams with balanced phosphorus doses.",
    baseReasonTe: "సమతుల్య భాస్వరం మోతాదులతో బాగా పారుదల ఉన్న ఇసుక లోమ్ నేలల్లో పెరుగుతుంది."
  },
  {
    id: "watermelon",
    nameEn: "Watermelon",
    nameTe: "పుచ్చకాయ (Watermelon)",
    season: "Zaid",
    reqN: 60,
    reqP: 40,
    reqK: 60,
    reqPh: 6.2,
    reqWater: 400,
    defaultYield: 25.3,
    soilTypeFit: ["Sandy", "Alluvial", "Loamy"],
    stages: ["Sowing", "Vining", "Flowering", "Fruiting", "Harvest"],
    implements: ["Light cultivators", "Mulch layers", "Drip irrigation setups"],
    baseReasonEn: "Optimal choice for warm zaid seasons utilizing sandy riverbeds.",
    baseReasonTe: "ఇసుక నదీతీరాలను ఉపయోగించుకునే వెచ్చని జైద్ సీజన్‌లకు అనుకూలం."
  }
];

const REGIONAL_BASELINES: Record<string, { n: number; p: number; k: number; ph: number; soilType: string }> = {
  "Anantapur": { n: 45, p: 12, k: 90, ph: 7.8, soilType: "Sandy" },
  "Guntur": { n: 135, p: 48, k: 110, ph: 7.2, soilType: "Black" },
  "NTR": { n: 165, p: 58, k: 70, ph: 6.3, soilType: "Alluvial" }
};

function CropSuitability() {
  const { lang, district, mandal, village } = useAppStore();

  // Interactive soil parameters configuration
  const [soilN, setSoilN] = useState<number>(110);
  const [soilP, setSoilP] = useState<number>(45);
  const [soilK, setSoilK] = useState<number>(65);
  const [soilPh, setSoilPh] = useState<number>(6.5);
  const [selectedSoilType, setSelectedSoilType] = useState<string>("Black");
  const [loadedGeoLabel, setLoadedGeoLabel] = useState<string>("Default NTR Region");

  // Comparison crop selection
  const [compareCrops, setCompareCrops] = useState<string[]>(["paddy", "cotton"]);

  // Dynamic baseline loader effect
  React.useEffect(() => {
    const base = REGIONAL_BASELINES[district] || REGIONAL_BASELINES["NTR"];
    
    // Simulate minor variations per mandal / village
    let nModifier = 0;
    let pModifier = 0;
    let kModifier = 0;
    let phModifier = 0;

    if (mandal && mandal !== "All Mandals") {
      nModifier += (mandal.length % 5) * 5 - 10;
      pModifier += (mandal.length % 3) * 3 - 3;
      kModifier += (mandal.length % 4) * 4 - 8;
      phModifier += (mandal.length % 2) * 0.2 - 0.1;
    }

    if (village && village !== "All Villages") {
      nModifier += (village.length % 4) * 4 - 6;
      pModifier += (village.length % 2) * 2 - 1;
      kModifier += (village.length % 3) * 5 - 5;
      phModifier += (village.length % 3) * 0.1 - 0.1;
    }

    setSoilN(Math.min(200, Math.max(10, Math.round(base.n + nModifier))));
    setSoilP(Math.min(100, Math.max(5, Math.round(base.p + pModifier))));
    setSoilK(Math.min(150, Math.max(10, Math.round(base.k + kModifier))));
    setSoilPh(Math.min(9.0, Math.max(4.5, parseFloat((base.ph + phModifier).toFixed(1)))));
    setSelectedSoilType(base.soilType);

    let label = "";
    if (village && village !== "All Villages") {
      label = `${village} Village Average`;
    } else if (mandal && mandal !== "All Mandals") {
      label = `${mandal} Mandal Average`;
    } else {
      label = `${district} District Average`;
    }
    setLoadedGeoLabel(label);
  }, [district, mandal, village]);

  const handleResetSliders = () => {
    const base = REGIONAL_BASELINES[district] || REGIONAL_BASELINES["NTR"];
    setSoilN(base.n);
    setSoilP(base.p);
    setSoilK(base.k);
    setSoilPh(base.ph);
    setSelectedSoilType(base.soilType);
  };

  // Suitability math model
  const calculateSuitability = (crop: typeof DEFAULT_CROPS[0]) => {
    const nMatch = Math.max(0, 100 - Math.abs(soilN - crop.reqN) * 0.4);
    const pMatch = Math.max(0, 100 - Math.abs(soilP - crop.reqP) * 1.2);
    const kMatch = Math.max(0, 100 - Math.abs(soilK - crop.reqK) * 0.8);
    const phMatch = Math.max(0, 100 - Math.abs(soilPh - crop.reqPh) * 25);
    const soilFit = crop.soilTypeFit.includes(selectedSoilType) ? 100 : 55;

    const overall = (nMatch * 0.2) + (pMatch * 0.2) + (kMatch * 0.2) + (phMatch * 0.2) + (soilFit * 0.2);
    return Math.min(99, Math.max(35, Math.round(overall)));
  };

  const handleToggleCompare = (id: string) => {
    if (compareCrops.includes(id)) {
      if (compareCrops.length > 1) {
        setCompareCrops(compareCrops.filter(c => c !== id));
      }
    } else {
      if (compareCrops.length < 3) {
        setCompareCrops([...compareCrops, id]);
      } else {
        setCompareCrops([compareCrops[1], compareCrops[2], id]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Target className="h-5 w-5" />}
        title={lang === "te" ? "పంట అనుకూలత ఇంజిన్" : "Crop Suitability Engine"}
        description={lang === "te" ? "నేల రసాయన అమరిక మరియు నీటి నిల్వల ద్వారా పంట అనుకూలత అంచనా." : "Calibrate crop suitability telemetry by simulating soil parameters, comparing crop variables, and plotting regional yields."}
        actions={<GeographicFilter />}
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Panel: Real-Time Soil Simulator */}
        <div className="lg:col-span-1 space-y-6">
          <Panel title="Soil Parameter Simulator" subtitle="Modify soil values to watch suitability recalculate">
            <div className="p-5 space-y-5">
              {/* Location baseline banner */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 flex items-center justify-between text-[11px] shadow-sm">
                <span className="text-muted-foreground font-medium">Active Baseline:</span>
                <span className="font-bold text-primary">{loadedGeoLabel}</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="soil-type-select">Soil Texture Class</Label>
                <select
                  id="soil-type-select"
                  value={selectedSoilType}
                  onChange={(e) => setSelectedSoilType(e.target.value)}
                  className="w-full bg-background/50 border border-border/60 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Black">Black Soil (Regur)</option>
                  <option value="Red">Red Soil</option>
                  <option value="Alluvial">Alluvial Soil</option>
                  <option value="Sandy">Sandy Loam</option>
                  <option value="Clay">Clay Soil</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <Label htmlFor="sim-n">Nitrogen (N)</Label>
                  <span className="font-bold text-primary font-mono">{soilN} kg/ha</span>
                </div>
                <input
                  type="range"
                  id="sim-n"
                  min="10"
                  max="200"
                  value={soilN}
                  onChange={(e) => setSoilN(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <Label htmlFor="sim-p">Phosphorus (P)</Label>
                  <span className="font-bold text-primary font-mono">{soilP} kg/ha</span>
                </div>
                <input
                  type="range"
                  id="sim-p"
                  min="5"
                  max="100"
                  value={soilP}
                  onChange={(e) => setSoilP(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <Label htmlFor="sim-k">Potassium (K)</Label>
                  <span className="font-bold text-primary font-mono">{soilK} kg/ha</span>
                </div>
                <input
                  type="range"
                  id="sim-k"
                  min="10"
                  max="150"
                  value={soilK}
                  onChange={(e) => setSoilK(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <Label htmlFor="sim-ph">Soil acidity (pH)</Label>
                  <span className="font-bold text-primary font-mono">{soilPh.toFixed(1)} pH</span>
                </div>
                <input
                  type="range"
                  id="sim-ph"
                  min="4.5"
                  max="9.0"
                  step="0.1"
                  value={soilPh}
                  onChange={(e) => setSoilPh(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <Button variant="outline" onClick={handleResetSliders} className="w-full text-xs gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Reset Default telemetry
              </Button>
            </div>
          </Panel>

          <Panel title="Regional Suitability Map" subtitle="Yield index map rendering">
            <div className="p-4 relative">
              <React.Suspense fallback={<div className="h-[260px] bg-muted/20 animate-pulse rounded border border-border flex items-center justify-center text-xs text-muted-foreground">Loading GIS Map...</div>}>
                <APMap metricKey="yieldGain" height={260} />
              </React.Suspense>
            </div>
          </Panel>
        </div>

        {/* Center Panel: Suitability Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Comparison Matrix */}
          <Panel title="Crop Comparison Matrix" subtitle="Compare critical parameters of selected crops side-by-side">
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="pb-2">Crop Details</th>
                    {compareCrops.map((cid) => {
                      const crop = DEFAULT_CROPS.find(c => c.id === cid)!;
                      const score = calculateSuitability(crop);
                      return (
                        <th key={cid} className="pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground">{lang === "te" ? crop.nameTe : crop.nameEn}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              score >= 80 ? "bg-success/15 text-success" : score >= 65 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                            }`}>{score}%</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-foreground/90 font-medium">
                  <tr>
                    <td className="py-3 font-bold">Recommended Season</td>
                    {compareCrops.map((cid) => {
                      const crop = DEFAULT_CROPS.find(c => c.id === cid)!;
                      return <td key={cid} className="py-3">{crop.season}</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Required Nitrogen (N)</td>
                    {compareCrops.map((cid) => {
                      const crop = DEFAULT_CROPS.find(c => c.id === cid)!;
                      return <td key={cid} className="py-3">{crop.reqN} kg/ha <span className="text-[10px] text-muted-foreground">(vs {soilN})</span></td>;
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Required Phosphorus (P)</td>
                    {compareCrops.map((cid) => {
                      const crop = DEFAULT_CROPS.find(c => c.id === cid)!;
                      return <td key={cid} className="py-3">{crop.reqP} kg/ha <span className="text-[10px] text-muted-foreground">(vs {soilP})</span></td>;
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Required Potassium (K)</td>
                    {compareCrops.map((cid) => {
                      const crop = DEFAULT_CROPS.find(c => c.id === cid)!;
                      return <td key={cid} className="py-3">{crop.reqK} kg/ha <span className="text-[10px] text-muted-foreground">(vs {soilK})</span></td>;
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Target Soil pH</td>
                    {compareCrops.map((cid) => {
                      const crop = DEFAULT_CROPS.find(c => c.id === cid)!;
                      return <td key={cid} className="py-3">{crop.reqPh} pH <span className="text-[10px] text-muted-foreground">(vs {soilPh.toFixed(1)})</span></td>;
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Water Requirement</td>
                    {compareCrops.map((cid) => {
                      const crop = DEFAULT_CROPS.find(c => c.id === cid)!;
                      return <td key={cid} className="py-3 font-bold text-info">{crop.reqWater} mm</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Estimated Yield</td>
                    {compareCrops.map((cid) => {
                      const crop = DEFAULT_CROPS.find(c => c.id === cid)!;
                      return <td key={cid} className="py-3 font-bold text-success">{crop.defaultYield} t/ha</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Crops List */}
          <div className="space-y-4">
            {DEFAULT_CROPS.map((c) => {
              const score = calculateSuitability(c);
              const isComparing = compareCrops.includes(c.id);
              return (
                <Panel key={c.id} bodyClassName="p-0 overflow-hidden">
                  <div className="p-5 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-foreground">{lang === "te" ? c.nameTe : c.nameEn}</span>
                        <Pill tone="muted">{c.season}</Pill>
                        <button
                          onClick={() => handleToggleCompare(c.id)}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                            isComparing ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted/10"
                          }`}
                        >
                          {isComparing ? "Comparing" : "+ Compare"}
                        </button>
                      </div>
                      <span className="text-3xl font-black tabular-nums" style={{ color: score >= 80 ? "var(--color-success)" : score >= 65 ? "var(--color-warning)" : "var(--color-destructive)" }}>{score}%</span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${score}%`,
                          background: score >= 80 ? "var(--color-success)" : score >= 65 ? "var(--color-warning)" : "var(--color-destructive)"
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-muted/10 border-t border-border/40 p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="col-span-2 space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary"/> AI Suitability Insight</p>
                        <div className="relative bg-background border border-border/50 px-3 py-2 rounded text-xs text-foreground/90 leading-snug">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30" />
                          {lang === "te" ? c.baseReasonTe : c.baseReasonEn}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-info"/> Water Req.</p>
                        <p className="text-lg font-black text-foreground">{c.reqWater} <span className="text-[10px] font-semibold text-muted-foreground">mm</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-warning"/> Est. Yield</p>
                        <p className="text-lg font-black text-foreground">{c.defaultYield} <span className="text-[10px] font-semibold text-muted-foreground">t/ha</span></p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">NPK Target:</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">N: {c.reqN}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20 font-bold">P: {c.reqP}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">K: {c.reqK}</span>
                      </div>

                      <div className="flex gap-2 items-center text-[11px] text-muted-foreground font-bold">
                        <Tractor className="h-3.5 w-3.5 text-primary" />
                        <span>Growth Stages:</span>
                        <div className="flex items-center gap-1">
                          {c.stages.map((stg, i) => (
                            <span key={stg} className="px-2 py-0.5 rounded bg-background border border-border/60 text-[10px] font-medium">{stg}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

