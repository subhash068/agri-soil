import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Gauge } from "@/components/ui-kit/Gauge";
import { useAppStore } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquareHeart, User, Sprout, MapPin, Ruler, Sparkles, Send, RefreshCw, Layers, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_app/farmer-advisory")({
  head: () => ({ meta: [{ title: "Farmer Advisory Center — AgriSoil AI" }] }),
  component: FarmerAdvisory,
});

const T = {
  en: {
    title: "Farmer Advisory Center",
    subtitle: "Personalized soil health diagnostics and crop recommendations",
    searchLabel: "Select Farmer Profile",
    health: "Soil Health Index",
    def: "Deficiencies & Metrics",
    rec: "Actionable Recommendations",
    impact: "Yield Impact",
    soilRemediation: "Soil Remediation Action Plan",
    smsLogs: "SMS Advisory Broadcast Logs",
    simulation: "Fertilizer Application Simulator",
    simTitle: "Simulate Amendment Influence",
    simDesc: "Select an amendment and amount to forecast simulated improvements in soil health and crop yields.",
    btnSimulate: "Apply Amendment",
    btnReset: "Reset",
    sent: "Sent",
    scheduled: "Scheduled",
    tabDiagnostics: "Soil Diagnostics",
    tabRemediation: "Remediation & SMS",
    tabSimulator: "Advisory Simulator",
    activeFarmer: "Active Farmer Profile",
    acres: "acres",
    soil: "Soil Type",
    crop: "Active Crop",
    location: "Location",
    customSms: "Broadcast Custom SMS Alert",
    smsPlaceholder: "Type custom agricultural advice to send to this farmer...",
    btnSendSms: "Send Broadcast SMS",
    smsSuccess: "SMS successfully queued for broadcasting!",
  },
  te: {
    title: "రైతు సలహా కేంద్రం",
    subtitle: "వ్యక్తిగతీకరించిన నేల ఆరోగ్య నిర్ధారణలు మరియు పంట సిఫార్సులు",
    searchLabel: "రైతు ప్రొఫైల్ ఎంచుకోండి",
    health: "నేల ఆరోగ్య సూచిక",
    def: "лоపాలు & కొలతలు",
    rec: "ఆచరణాత్మక సిఫార్సులు",
    impact: "దిగుబడి ప్రభావం",
    soilRemediation: "నేల పునరుద్ధరణ కార్యాచరణ ప్రణాళిక",
    smsLogs: "SMS సలహా ప్రసార చిట్టాలు",
    simulation: "ఎరువుల అప్లికేషన్ సిమ్యులేటర్",
    simTitle: "సవరణ ప్రభావాన్ని అనుకరించండి",
    simDesc: "నేల ఆరోగ్యం మరియు పంట దిగుబడిలో అనుకరణ మెరుగుదలలను అంచనా వేయడానికి సవరణ మరియు మొత్తాన్ని ఎంచుకోండి.",
    btnSimulate: "సవరణను వర్తించు",
    btnReset: "రీసెట్",
    sent: "పంపబడింది",
    scheduled: "షెడ్యూల్ చేయబడింది",
    tabDiagnostics: "నేల నిర్ధారణ",
    tabRemediation: "పునరుద్ధరణ & SMS",
    tabSimulator: "సలహా సిమ్యులేటర్",
    activeFarmer: "క్రియాశీల రైతు ప్రొఫైల్",
    acres: "ఎకరాలు",
    soil: "నేల రకం",
    crop: "క్రియాశీల పంట",
    location: "ప్రదేశము",
    customSms: "అనుకూల SMS హెచ్చరికను ప్రసారం చేయండి",
    smsPlaceholder: "ఈ రైతుకు పంపడానికి అనుకూల వ్యవసాయ సలహాను టైప్ చేయండి...",
    btnSendSms: "బ్రాడ్‌కాస్ట్ SMS పంపండి",
    smsSuccess: "బ్రాడ్‌కాస్టింగ్ కోసం SMS విజయవంతంగా క్యూలో ఉంచబడింది!",
  }
};

const FARMERS = [
  {
    id: "ramaiah",
    name: "K. Ramaiah",
    location: "Tadikonda, Guntur",
    locationTe: "తాడికొండ, గుంటూరు",
    crop: "Cotton",
    cropTe: "ప్రత్తి",
    area: 2.4,
    soil: "Black Soil",
    soilTe: "నల్ల రేగడి నేల",
    healthScore: 61,
    healthLabel: "Moderate",
    healthLabelTe: "మధ్యస్థం",
    healthColor: "var(--color-warning)",
    ph: 7.8,
    moisture: "28%",
    defs: [
      { name: "Nitrogen (N)", nameTe: "నత్రజని (N)", value: 140, unit: " kg/ha", severity: "Severe", severityTe: "తీవ్రమైనది" },
      { name: "Zinc (Zn)", nameTe: "జింక్ (Zn)", value: 0.45, unit: " ppm", severity: "Critical", severityTe: "కీలకమైనది" },
      { name: "Organic Carbon (OC)", nameTe: "సేంద్రీయ కర్బనం (OC)", value: 0.38, unit: " %", severity: "Moderate", severityTe: "మధ్యస్థంగా" }
    ],
    recs: [
      { name: "Nitrogen Side-dressing (Urea)", nameTe: "నత్రజని సైడ్-డ్రెస్సింగ్ (యూరియా)", dosage: "45 kg / acre", dosageTe: "45 కిలోలు / ఎకరాకు", timing: "Apply in 3 split doses at squaring stage", timingTe: "కాయలు ఏర్పడే దశలో 3 విభజించబడిన మోతాదులలో వర్తించండి", yieldGain: 18 },
      { name: "Zinc Sulphate Foliar Spray", nameTe: "జింక్ సల్ఫేట్ ఫోలియర్ స్ప్రే", dosage: "2 g / Litre of water", dosageTe: "2 గ్రాములు / లీటర్ నీటికి", timing: "Spray at 30 and 45 days after sowing", timingTe: "విత్తిన 30 మరియు 45 రోజుల తర్వాత పిచికారీ చేయండి", yieldGain: 12 },
      { name: "Farm Yard Manure (FYM)", nameTe: "పశువుల ఎరువు (FYM)", dosage: "5 tonnes / acre", dosageTe: "5 టన్నులు / ఎకరాకు", timing: "Incorporate during land preparation", timingTe: "నేల తయారీ సమయంలో కలపండి", yieldGain: 8 }
    ],
    remediation: [
      { step: "1", title: "Split application of Urea", titleTe: "యూరియా విభజించి వేయడం", desc: "Reduces run-off in clayey Black soil during irrigation cycles.", descTe: "నీటి పారుదల చక్రాలలో నల్ల రేగడి నేలలో యూరియా వృధా కాకుండా తగ్గిస్తుంది." },
      { step: "2", title: "Incorporate green manure crops", titleTe: "పచ్చిరొట్ట ఎరువుల సాగు", desc: "Grow Dhaincha or Sunnhemp before the main cropping season to boost organic carbon.", descTe: "సేంద్రీయ కర్బనాన్ని పెంచడానికి ప్రధాన పంట కాలానికి ముందు జనుము లేదా జీలుగ సాగు చేయండి." },
      { step: "3", title: "Apply Zinc Sulphate directly to soil", titleTe: "నేలకు నేరుగా జింక్ సల్ఫేట్ వేయడం", desc: "Add 10 kg/acre Zinc Sulphate to address critical soil micro-nutrient gaps.", descTe: "కీలకమైన నేల సూక్ష్మపోషకాల లోపాలను పరిష్కరించడానికి 10 కిలోల జింక్ సల్ఫేట్ వేయండి." }
    ],
    sms: [
      { message: "Your soil has severe Nitrogen deficiency. Apply 45 kg of Urea/acre in split doses.", status: "sent", date: "2 hours ago" },
      { message: "Scheduled: Current dry spell warning: Please initiate micro-irrigation for cotton squaring stage.", status: "scheduled", date: "June 13, 08:00 AM" }
    ]
  },
  {
    id: "apparao",
    name: "Y. Apparao",
    location: "Chandarlapadu, NTR",
    locationTe: "చందర్లపాడు, ఎన్టీఆర్",
    crop: "Paddy (Rice)",
    cropTe: "వరి",
    area: 4.5,
    soil: "Red Sandy Loam",
    soilTe: "ఎర్ర ఇసుక లోమ్ నేల",
    healthScore: 78,
    healthLabel: "Good",
    healthLabelTe: "మంచిది",
    healthColor: "var(--color-success)",
    ph: 6.5,
    moisture: "45%",
    defs: [
      { name: "Phosphorus (P)", nameTe: "భాస్వరం (P)", value: 18, unit: " kg/ha", severity: "Moderate", severityTe: "మధ్యస్థంగా" },
      { name: "Potassium (K)", nameTe: "పొటాషియం (K)", value: 110, unit: " kg/ha", severity: "Mild", severityTe: "తేలికపాటి" },
      { name: "Iron (Fe)", nameTe: "ఇనుము (Fe)", value: 3.8, unit: " ppm", severity: "Moderate", severityTe: "మధ్యస్థంగా" }
    ],
    recs: [
      { name: "Single Super Phosphate (SSP)", nameTe: "సింగిల్ సూపర్ ఫాస్ఫేట్ (SSP)", dosage: "75 kg / acre", dosageTe: "75 కిలోలు / ఎకరాకు", timing: "Basal application at transplanting", timingTe: "నాట్లు వేసే సమయంలో బేసల్ అప్లికేషన్", yieldGain: 15 },
      { name: "Muriate of Potash (MOP)", nameTe: "మ్యూరియేట్ ఆఫ్ పొటాష్ (MOP)", dosage: "25 kg / acre", dosageTe: "25 కిలోలు / ఎకరాకు", timing: "Apply at tillering and panicle initiation", timingTe: "పిలకలు తొడిగే మరియు కంకి దశలో వేయండి", yieldGain: 9 },
      { name: "Ferrous Sulphate Spray", nameTe: "ఫెర్రస్ సల్ఫేట్ స్ప్రే", dosage: "5 g / Litre of water", dosageTe: "5 గ్రాములు / లీటర్ నీటికి", timing: "Foliar spray to prevent iron chlorosis", timingTe: "ఇనుము లోపం వల్ల ఆకులు పచ్చబడటాన్ని నివారించడానికి ఫోలియర్ స్ప్రే", yieldGain: 6 }
    ],
    remediation: [
      { step: "1", title: "Basal Phosphorus incorporation", titleTe: "బేసల్ భాస్వరం చేర్చడం", desc: "Mix Single Super Phosphate in soil before transplanting to ensure strong root establishment.", descTe: "బలమైన వేర్ల వ్యవస్థను నిర్ధారించడానికి నాట్లు వేయడానికి ముందు నేలలో సింగిల్ సూపర్ ఫాస్ఫేట్ కలపండి." },
      { step: "2", title: "Split Potassium application", titleTe: "పొటాషియంను విభజించి వేయడం", desc: "Split Muriate of Potash doses to match peak tillering absorption rates.", descTe: "పిలకలు తొడిగే దశలో పొటాషియం గ్రహింపును పెంచడానికి మోతాదులను విభజించండి." }
    ],
    sms: [
      { message: "Soil tests show moderate Phosphorus deficiency. Apply Single Super Phosphate before transplanting.", status: "sent", date: "1 day ago" },
      { message: "Scheduled: Next rainfall expected on Mon (12mm). Optimal timing for basal fertilizer application.", status: "scheduled", date: "June 15, 09:00 AM" }
    ]
  },
  {
    id: "chennakesavulu",
    name: "M. Chennakesavulu",
    location: "Dharmavaram, Anantapur",
    locationTe: "ధర్మవరం, అనంతపురం",
    crop: "Groundnut",
    cropTe: "వేరుశనగ",
    area: 3.2,
    soil: "Red Alfisol",
    soilTe: "ఎర్ర ఆల్ఫిసోల్ నేల",
    healthScore: 42,
    healthLabel: "Poor",
    healthLabelTe: "బలహీనంగా",
    healthColor: "var(--color-destructive)",
    ph: 8.2,
    moisture: "15%",
    defs: [
      { name: "Phosphorus (P)", nameTe: "భాస్వరం (P)", value: 9, unit: " kg/ha", severity: "Critical", severityTe: "కీలకమైనది" },
      { name: "Sulphur (S)", nameTe: "సల్ఫర్ (S)", value: 6.2, unit: " ppm", severity: "Critical", severityTe: "కీలకమైనది" },
      { name: "Boron (B)", nameTe: "బోరాన్ (B)", value: 0.28, unit: " ppm", severity: "Severe", severityTe: "తీవ్రమైనది" }
    ],
    recs: [
      { name: "Gypsum Application", nameTe: "జిప్సం అప్లికేషన్", dosage: "200 kg / acre", dosageTe: "200 కిలోలు / ఎకరాకు", timing: "Apply at pegging stage (40-45 days after sowing)", timingTe: "ఊడలు దిగే దశలో వర్తించండి (విత్తిన 40-45 రోజుల తర్వాత)", yieldGain: 22 },
      { name: "Borax soil application", nameTe: "బోరాక్స్ నేల అప్లికేషన్", dosage: "4 kg / acre", dosageTe: "4 కిలోలు / ఎకరాకు", timing: "Apply during early soil preparation", timingTe: "ముందస్తు నేల తయారీ సమయంలో వర్తించండి", yieldGain: 14 },
      { name: "Single Super Phosphate (SSP)", nameTe: "సింగిల్ సూపర్ ఫాస్ఫేట్ (SSP)", dosage: "60 kg / acre", dosageTe: "60 కిలోలు / ఎకరాకు", timing: "Apply as basal dose during sowing", timingTe: "విత్తే సమయంలో బేసల్ డోస్‌గా వర్తించండి", yieldGain: 11 }
    ],
    remediation: [
      { step: "1", title: "Apply Gypsum at pegging stage", titleTe: "ఊడలు దిగే దశలో జిప్సం వేయడం", desc: "Critical for shell formation and pod development in Groundnut crops.", descTe: "వేరుశనగ పంటలలో కాయ నాణ్యత మరియు ఊడలు దిగడానికి ఇది చాలా అవసరం." },
      { step: "2", title: "Broadcasting Borax", titleTe: "బోరాక్స్ చల్లడం", desc: "Corrects Boron deficiency which causes 'hollow-heart' disorder in pods.", descTe: "కాయలలో 'బోలు గుండె' లోపాన్ని కలిగించే బోరాన్ లోపాన్ని సరిదిద్దుతుంది." }
    ],
    sms: [
      { message: "Critical Boron deficiency detected. Apply Borax at 5kg/acre to prevent empty pods.", status: "sent", date: "3 days ago" },
      { message: "Sent: Extreme heat alert (38°C). Avoid chemical spraying to prevent leaf burn.", status: "sent", date: "June 10" }
    ]
  }
];

function FarmerAdvisory() {
  const lang = useAppStore((s) => s.lang);
  const t = T[lang];

  const [activeFarmerId, setActiveFarmerId] = useState<string>("ramaiah");
  const [activeTab, setActiveTab] = useState<"diagnostics" | "remediation" | "simulator">("diagnostics");

  // Custom SMS broadcast state
  const [customSmsText, setCustomSmsText] = useState<string>("");
  const [smsStatusMessage, setSmsStatusMessage] = useState<string>("");

  // Simulator state
  const [selectedAmendment, setSelectedAmendment] = useState<string>("urea");
  const [dosageAmount, setDosageAmount] = useState<number>(100);
  const [simulationResult, setSimulationResult] = useState<{ health: number; yield: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const farmer = FARMERS.find((f) => f.id === activeFarmerId) || FARMERS[0];

  const handleSendCustomSms = () => {
    if (!customSmsText.trim()) return;
    
    // Add to current farmer's SMS logs locally
    farmer.sms.unshift({
      message: customSmsText,
      status: "sent",
      date: "Just now"
    });

    setCustomSmsText("");
    setSmsStatusMessage(t.smsSuccess);
    setTimeout(() => setSmsStatusMessage(""), 4000);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulationResult(null);

    setTimeout(() => {
      let healthInc = 0;
      let yieldInc = 0;

      if (selectedAmendment === "urea") {
        healthInc = Math.min(15, Math.round(dosageAmount * 0.08));
        yieldInc = Math.min(20, Math.round(dosageAmount * 0.12));
      } else if (selectedAmendment === "ssp") {
        healthInc = Math.min(12, Math.round(dosageAmount * 0.06));
        yieldInc = Math.min(18, Math.round(dosageAmount * 0.10));
      } else if (selectedAmendment === "gypsum") {
        healthInc = Math.min(18, Math.round(dosageAmount * 0.07));
        yieldInc = Math.min(22, Math.round(dosageAmount * 0.09));
      } else if (selectedAmendment === "compost") {
        healthInc = Math.min(25, Math.round(dosageAmount * 0.15));
        yieldInc = Math.min(12, Math.round(dosageAmount * 0.05));
      }

      setSimulationResult({
        health: farmer.healthScore + healthInc,
        yield: yieldInc
      });
      setIsSimulating(false);
    }, 1000);
  };

  const handleResetSimulation = () => {
    setSimulationResult(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<MessageSquareHeart className="h-5 w-5" />}
        title={t.title}
        description={t.subtitle}
        actions={
          <div className="flex items-center gap-2">
            <Select value={activeFarmerId} onValueChange={setActiveFarmerId}>
              <SelectTrigger className="w-[220px] bg-background/50 border-border/60">
                <SelectValue placeholder={t.searchLabel} />
              </SelectTrigger>
              <SelectContent>
                {FARMERS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} ({lang === "en" ? f.crop : f.cropTe})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Pill tone="info">{lang === "en" ? "English" : "తెలుగు"}</Pill>
          </div>
        }
      />

      {/* Farmer Overview Card */}
      <Panel title={t.activeFarmer} subtitle={lang === "en" ? farmer.location : farmer.locationTe}>
        <div className="p-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Farmer Name</p>
              <p className="text-sm font-bold text-foreground">{farmer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
            <Sprout className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.crop}</p>
              <p className="text-sm font-bold text-foreground">{lang === "en" ? farmer.crop : farmer.cropTe}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
            <Ruler className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Farm Size</p>
              <p className="text-sm font-bold text-foreground">{farmer.area} {t.acres}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
            <Layers className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.soil}</p>
              <p className="text-sm font-bold text-foreground">{lang === "en" ? farmer.soil : farmer.soilTe}</p>
            </div>
          </div>
        </div>
      </Panel>

      {/* Tabs Menu */}
      <div className="flex border-b border-border/40 gap-4">
        <button
          onClick={() => setActiveTab("diagnostics")}
          className={`pb-2.5 text-sm font-semibold transition-all border-b-2 px-1 ${
            activeTab === "diagnostics" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.tabDiagnostics}
        </button>
        <button
          onClick={() => setActiveTab("remediation")}
          className={`pb-2.5 text-sm font-semibold transition-all border-b-2 px-1 ${
            activeTab === "remediation" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.tabRemediation}
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`pb-2.5 text-sm font-semibold transition-all border-b-2 px-1 ${
            activeTab === "simulator" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.tabSimulator}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "diagnostics" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-5">
            <Panel title={t.health} subtitle="Aggregated Soil Quality Index">
              <div className="p-6 flex flex-col items-center justify-center">
                <Gauge
                  value={farmer.healthScore}
                  color={farmer.healthColor}
                  label={lang === "en" ? farmer.healthLabel : farmer.healthLabelTe}
                />
                <div className="mt-4 w-full grid grid-cols-2 gap-3 text-center border-t border-border/40 pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Soil pH Level</p>
                    <p className="text-lg font-bold text-foreground">{farmer.ph} (Neutral)</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Topsoil Moisture</p>
                    <p className="text-lg font-bold text-foreground">{farmer.moisture}</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Panel title={t.def} subtitle="Tested nutrient deficiencies & chemical properties">
              <div className="p-5 space-y-3">
                {farmer.defs.map((d) => (
                  <div key={d.name} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">{lang === "en" ? d.name : d.nameTe}</p>
                      <p className="text-xs text-muted-foreground">Tested Value: <span className="font-semibold text-foreground">{d.value}{d.unit}</span></p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold text-white`}
                      style={{
                        background:
                          d.severity === "Critical"
                            ? "var(--color-destructive)"
                            : d.severity === "Severe"
                            ? "var(--color-warning)"
                            : "var(--color-info)"
                      }}
                    >
                      {lang === "en" ? d.severity : d.severityTe}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title={t.rec} subtitle="Custom target fertilizers and optimal dosages">
              <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {farmer.recs.map((r) => (
                  <div key={r.name} className="rounded-lg border border-border/60 bg-background/50 p-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-foreground">{lang === "en" ? r.name : r.nameTe}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Dosage: <span className="font-bold text-foreground">{lang === "en" ? r.dosage : r.dosageTe}</span>
                      </p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground italic">
                        {lang === "en" ? r.timing : r.timingTe}
                      </p>
                    </div>
                    <div className="mt-4 border-t border-border/20 pt-2.5">
                      <p className="text-xs text-emerald-400 font-bold">
                        {t.impact}: +{r.yieldGain}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {activeTab === "remediation" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Panel title={t.soilRemediation} subtitle="Step-by-step action plan to balance chemical profiles">
              <div className="p-5 space-y-4">
                {farmer.remediation.map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 rounded-lg border border-border/50 bg-background/30 hover:bg-muted/10 transition-colors">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">{lang === "en" ? item.title : item.titleTe}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{lang === "en" ? item.desc : item.descTe}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Panel title={t.customSms} subtitle="Broadcast live advice directly to farmer mobile">
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sms-text">{t.customSms}</Label>
                  <textarea
                    id="sms-text"
                    value={customSmsText}
                    onChange={(e) => setCustomSmsText(e.target.value)}
                    placeholder={t.smsPlaceholder}
                    rows={4}
                    className="w-full text-xs p-3 rounded-md border border-border bg-background/50 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                {smsStatusMessage && (
                  <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 flex gap-2 items-center text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{smsStatusMessage}</span>
                  </div>
                )}
                <Button onClick={handleSendCustomSms} className="w-full text-xs font-semibold gap-2">
                  <Send className="h-3.5 w-3.5" />
                  {t.btnSendSms}
                </Button>
              </div>
            </Panel>

            <Panel title={t.smsLogs} subtitle="Broadcast history for this profile">
              <div className="p-5 space-y-3">
                {farmer.sms.map((msg, idx) => (
                  <div key={idx} className="rounded-lg border border-border/40 p-3.5 space-y-2 bg-background/25">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        msg.status === "sent" ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                      }`}>
                        {msg.status === "sent" ? t.sent : t.scheduled}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">{msg.date}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-foreground/95">{msg.message}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {activeTab === "simulator" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Panel title={t.simTitle} subtitle={t.simDesc}>
              <div className="p-5 space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="amendment-select">Amendment Type</Label>
                  <Select value={selectedAmendment} onValueChange={setSelectedAmendment}>
                    <SelectTrigger id="amendment-select" className="bg-background/50 border-border/60">
                      <SelectValue placeholder="Select Amendment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urea">Urea (Nitrogen)</SelectItem>
                      <SelectItem value="ssp">Single Super Phosphate (P)</SelectItem>
                      <SelectItem value="gypsum">Gypsum (Sulphur/Calcium)</SelectItem>
                      <SelectItem value="compost">Compost / Organic Manure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dosage-range">Dosage Quantity</Label>
                    <span className="text-xs font-bold text-primary">{dosageAmount} kg / acre</span>
                  </div>
                  <input
                    type="range"
                    id="dosage-range"
                    min="20"
                    max="250"
                    step="10"
                    value={dosageAmount}
                    onChange={(e) => setDosageAmount(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                    <span>20 kg</span>
                    <span>250 kg</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSimulate} className="flex-1 text-xs font-semibold gap-1.5" disabled={isSimulating}>
                    {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-amber-300" />}
                    {t.btnSimulate}
                  </Button>
                  <Button onClick={handleResetSimulation} variant="outline" className="text-xs font-semibold">
                    {t.btnReset}
                  </Button>
                </div>
              </div>
            </Panel>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Panel title="Simulation Forecast Results" subtitle="Estimated response to amendment application">
              <div className="p-6 flex flex-col justify-center min-h-[250px]">
                {isSimulating ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-semibold animate-pulse">Running soil chemistry simulation model...</p>
                  </div>
                ) : simulationResult ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col items-center justify-center p-4 border border-border/50 rounded-lg bg-background/40">
                      <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">Simulated Soil Health Score</p>
                      <Gauge
                        value={simulationResult.health}
                        color={simulationResult.health >= 80 ? "var(--color-success)" : "var(--color-warning)"}
                        label={`Improved from ${farmer.healthScore}`}
                      />
                    </div>
                    <div className="flex flex-col justify-center p-6 border border-border/50 rounded-lg bg-background/40 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated Crop Yield Gain</p>
                        <p className="text-4xl font-extrabold text-emerald-400">+{simulationResult.yield}%</p>
                      </div>
                      <div className="flex gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-md p-3">
                        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-emerald-400">Simulation Complete</p>
                          <p className="text-[11px] text-muted-foreground">Applying {dosageAmount}kg/acre of {selectedAmendment.toUpperCase()} balances targeted deficient components, improving nutrient efficiency and bolstering cotton squaring vitality.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-semibold">Select and apply amendments to generate live forecasts</p>
                    <p className="text-[11px] text-muted-foreground max-w-sm">Calculations are based on crop nutrition models specific to regional soil type and nitrogen absorption efficiency.</p>
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
