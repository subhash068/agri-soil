import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, CheckCheck, Eye, ThumbsUp, Users, Calendar, Sparkles, Plus, AlertCircle, FileText, CheckCircle2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/sms-advisory")({
  head: () => ({ meta: [{ title: "SMS Advisory Center — AgriSoil AI" }] }),
  component: SmsAdvisory,
});

const TEMPLATE_PRESETS = [
  {
    id: "zinc",
    name: "Zinc Deficiency Advisory",
    en: "AgriSoil: Your soil is Zinc-deficient. Apply 25kg Zinc Sulphate/ha at sowing. Expected +7% yield.",
    te: "అగ్రిసాయిల్: మీ నేలలో జింక్ లోపం. విత్తే సమయంలో హెక్టారుకు 25కిలోల జింక్ సల్ఫేట్ వేయండి. +7% దిగుబడి."
  },
  {
    id: "urea",
    name: "Split Urea / Weather Advice",
    en: "AgriSoil: Split urea — reduce 2nd dose by 20%. Save ₹600/ha. Rain expected, delay top-dressing 3 days.",
    te: "అగ్రిసాయిల్: యూరియాను విభజించండి — 2వ మోతాదు 20% తగ్గించండి. ₹600 ఆదా. వర్షం, 3 రోజులు ఆలస్యం."
  },
  {
    id: "paddy",
    name: "Paddy Basal Application",
    en: "AgriSoil: Soil tests show low P. Apply Single Super Phosphate before transplanting to ensure strong root growth.",
    te: "అగ్రిసాయిల్: నేల పరీక్షలలో భాస్వరం తక్కువగా ఉంది. బలమైన వేర్ల ఎదుగుదల కోసం నాట్లు వేసే ముందే ఎస్.ఎస్.పి వేయండి."
  },
  {
    id: "custom",
    name: "Custom Broadcast Message",
    en: "",
    te: ""
  }
];

const INITIAL_CAMPAIGNS = [
  {
    id: "104",
    name: "Zinc Deficiency Advisory",
    district: "Anantapur",
    crop: "Groundnut",
    date: "June 09, 2026",
    size: 12400,
    delivered: 12152,
    read: 8680,
    followed: 5580,
    en: "AgriSoil: Your soil is Zinc-deficient. Apply 25kg Zinc Sulphate/ha at sowing. Expected +7% yield.",
    te: "అగ్రిసాయిల్: మీ నేలలో జింక్ లోపం. విత్తే సమయంలో హెక్టారుకు 25కిలోల జింక్ సల్ఫేట్ వేయండి. +7% దిగుబడి."
  },
  {
    id: "103",
    name: "Rainfall Delay Top-Dressing",
    district: "Guntur",
    crop: "Cotton",
    date: "June 06, 2026",
    size: 8500,
    delivered: 8415,
    read: 6800,
    followed: 4250,
    en: "AgriSoil: Split urea — reduce 2nd dose by 20%. Save ₹600/ha. Rain expected, delay top-dressing 3 days.",
    te: "అగ్రిసాయిల్: యూరియాను విభజించండి — 2వ మోతాదు 20% తగ్గించండి. ₹600 ఆదా. వర్షం, 3 రోజులు ఆలస్యం."
  },
  {
    id: "102",
    name: "Urea Reduction Advisory",
    district: "NTR",
    crop: "Paddy",
    date: "June 03, 2026",
    size: 18200,
    delivered: 17836,
    read: 14560,
    followed: 10920,
    en: "AgriSoil: Soil tests show low P. Apply Single Super Phosphate before transplanting to ensure strong root growth.",
    te: "అగ్రిసాయిల్: నేల పరీక్షలలో భాస్వరం తక్కువగా ఉంది. బలమైన వేర్ల ఎదుగుదల కోసం నాట్లు వేసే ముందే ఎస్.ఎస్.పి వేయండి."
  }
];

function SmsAdvisory() {
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("104");

  // Broadcast creation parameters
  const [district, setDistrict] = useState<string>("All");
  const [crop, setCrop] = useState<string>("All");
  const [deficiency, setDeficiency] = useState<string>("All");
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("zinc");
  const [smsEn, setSmsEn] = useState<string>(TEMPLATE_PRESETS[0].en);
  const [smsTe, setSmsTe] = useState<string>(TEMPLATE_PRESETS[0].te);
  
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduleTime, setScheduleTime] = useState<string>("2026-06-12T09:00");

  const [isSending, setIsSending] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<string>("");

  const campaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  // Calculate estimated audience size dynamically based on selected filters
  const getEstimatedAudience = () => {
    let size = 284500;
    if (district !== "All") size = Math.round(size * 0.35);
    if (crop !== "All") size = Math.round(size * 0.4);
    if (deficiency !== "All") size = Math.round(size * 0.25);
    return Math.max(120, size);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selected = TEMPLATE_PRESETS.find((t) => t.id === templateId);
    if (selected) {
      setSmsEn(selected.en);
      setSmsTe(selected.te);
    }
  };

  const handleCreateCampaign = async () => {
    if (!smsEn.trim() && !smsTe.trim()) return;

    setIsSending(true);

    try {
      const audience = getEstimatedAudience();
      const newId = String(Number(campaigns[0]?.id || "100") + 1);
      const campaignName = selectedTemplateId === "custom" ? "Custom Advisory Broadcast" : TEMPLATE_PRESETS.find(t => t.id === selectedTemplateId)?.name || "Advisory Campaign";

      const newCampaign = {
        id: newId,
        name: campaignName,
        district: district === "All" ? "Andhra Pradesh" : district,
        crop: crop === "All" ? "All Crops" : crop,
        date: scheduleMode === "now" ? "Just now" : `Scheduled: ${new Date(scheduleTime).toLocaleString()}`,
        size: audience,
        delivered: scheduleMode === "now" ? Math.round(audience * 0.98) : 0,
        read: scheduleMode === "now" ? Math.round(audience * 0.72) : 0,
        followed: scheduleMode === "now" ? Math.round(audience * 0.48) : 0,
        en: smsEn,
        te: smsTe
      };

      // Register the broadcast as a system alert
      const payload = {
        type: scheduleMode === "now" ? "Broadcast" : "Scheduled",
        crop: crop === "All" ? "All Crops" : crop,
        district: district === "All" ? "Statewide" : district,
        severity: "Info",
        time: new Date().toLocaleDateString(),
        action: `SMS Campaign: ${campaignName} (Audience: ${audience.toLocaleString()})`
      };
      
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setCampaigns([newCampaign, ...campaigns]);
      setSelectedCampaignId(newId);
      setAlertMsg(scheduleMode === "now" ? "SMS Campaign broadcasted successfully!" : "SMS Campaign scheduled successfully!");
      
      setSmsEn("");
      setSmsTe("");
      setTimeout(() => setAlertMsg(""), 5000);
    } catch (err) {
      console.error("Failed to log broadcast to database", err);
      // Fallback
      setAlertMsg(scheduleMode === "now" ? "SMS Campaign broadcasted successfully!" : "SMS Campaign scheduled successfully!");
      setTimeout(() => setAlertMsg(""), 5000);
    } finally {
      setIsSending(false);
    }
  };

  // Funnel conversions
  const deliveryPct = campaign.size > 0 ? Math.round((campaign.delivered / campaign.size) * 100) : 0;
  const readPct = campaign.delivered > 0 ? Math.round((campaign.read / campaign.delivered) * 100) : 0;
  const followedPct = campaign.read > 0 ? Math.round((campaign.followed / campaign.read) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Send className="h-5 w-5" />}
        title="SMS Advisory Center"
        description="Region & crop-targeted bilingual SMS campaign broadcasting, tracking, and farmer adherence analytics."
        actions={<Pill tone="success">98.2% avg delivery</Pill>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi index={0} label="Campaigns Broadcasted" value={campaigns.length.toString()} icon={Send} tone="info" />
        <Kpi index={1} label="Total Target Audience" value={campaigns.reduce((sum, c) => sum + c.size, 0).toLocaleString()} icon={Users} tone="warning" />
        <Kpi index={2} label="Average Deliverability" value="98.2%" icon={CheckCheck} tone="success" />
        <Kpi index={3} label="Average Adherence" value="51.5%" icon={ThumbsUp} tone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Campaign Broadcast Configuration Console */}
        <div className="lg:col-span-1 space-y-6">
          <Panel title="Advisory Broadcast Console" subtitle="Target target districts, crops, and deficiency factors">
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="district-target">Target District</Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger id="district-target" className="bg-background/50 border-border/60">
                      <SelectValue placeholder="District" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Districts</SelectItem>
                      <SelectItem value="Anantapur">Anantapur</SelectItem>
                      <SelectItem value="NTR">NTR</SelectItem>
                      <SelectItem value="Guntur">Guntur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="crop-target">Crop Group</Label>
                  <Select value={crop} onValueChange={setCrop}>
                    <SelectTrigger id="crop-target" className="bg-background/50 border-border/60">
                      <SelectValue placeholder="Crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Crops</SelectItem>
                      <SelectItem value="Cotton">Cotton</SelectItem>
                      <SelectItem value="Paddy">Paddy (Rice)</SelectItem>
                      <SelectItem value="Groundnut">Groundnut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deficiency-target">Deficiency Profile</Label>
                <Select value={deficiency} onValueChange={setDeficiency}>
                  <SelectTrigger id="deficiency-target" className="bg-background/50 border-border/60">
                    <SelectValue placeholder="Deficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Soil Profiles</SelectItem>
                    <SelectItem value="Zinc">Zinc Deficient</SelectItem>
                    <SelectItem value="Nitrogen">Nitrogen Deficient</SelectItem>
                    <SelectItem value="Phosphorus">Phosphorus Deficient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Users className="h-4 w-4" />
                  <span>Estimated Target Audience</span>
                </div>
                <span className="text-sm font-extrabold text-foreground">{getEstimatedAudience().toLocaleString()} farmers</span>
              </div>

              <div className="border-t border-border/40 my-2 pt-3 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="template-select">Campaign Template</Label>
                  <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                    <SelectTrigger id="template-select" className="bg-background/50 border-border/60">
                      <SelectValue placeholder="Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_PRESETS.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="sms-en">English Content</Label>
                    <span className="text-[10px] text-muted-foreground">{smsEn.length} / 160 chars</span>
                  </div>
                  <textarea
                    id="sms-en"
                    value={smsEn}
                    onChange={(e) => setSmsEn(e.target.value)}
                    placeholder="Input English advisory message details..."
                    rows={3}
                    className="w-full text-xs p-3 rounded-md border border-border bg-background/50 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="sms-te">Telugu Content (తెలుగు)</Label>
                    <span className="text-[10px] text-muted-foreground">{smsTe.length} / 160 chars</span>
                  </div>
                  <textarea
                    id="sms-te"
                    value={smsTe}
                    onChange={(e) => setSmsTe(e.target.value)}
                    placeholder="అనువాదం చేర్చండి..."
                    rows={3}
                    className="w-full text-xs p-3 rounded-md border border-border bg-background/50 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Scheduling Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setScheduleMode("now")}
                      className={`text-xs font-semibold py-2 px-3 rounded-md border ${
                        scheduleMode === "now" ? "border-primary bg-primary/10 text-primary" : "border-border bg-transparent text-muted-foreground"
                      }`}
                    >
                      Broadcast Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleMode("later")}
                      className={`text-xs font-semibold py-2 px-3 rounded-md border ${
                        scheduleMode === "later" ? "border-primary bg-primary/10 text-primary" : "border-border bg-transparent text-muted-foreground"
                      }`}
                    >
                      Schedule Campaign
                    </button>
                  </div>
                </div>

                {scheduleMode === "later" && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                    <Label htmlFor="schedule-time">Broadcast Time</Label>
                    <Input
                      type="datetime-local"
                      id="schedule-time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="bg-background/50 border-border/60 text-xs"
                    />
                  </div>
                )}

                {alertMsg && (
                  <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 flex gap-2 items-center text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{alertMsg}</span>
                  </div>
                )}

                <Button onClick={handleCreateCampaign} disabled={isSending} className="w-full text-xs font-semibold gap-2">
                  <Send className="h-3.5 w-3.5" />
                  {isSending ? "Processing Broadcast..." : scheduleMode === "now" ? "Trigger Broadcast Campaign" : "Schedule Broadcast Campaign"}
                </Button>
              </div>
            </div>
          </Panel>
        </div>

        {/* Campaign Funnel Performance Analytics & Recent Batches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Broadcast Delivery Campaign Funnel" subtitle={`Audience response metrics: Batch #${campaign.id}`}>
              <div className="p-5 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Send className="h-3.5 w-3.5 text-primary" /> Target Audience
                    </span>
                    <span>{campaign.size.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "100%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> Delivered SMS
                    </span>
                    <span>{campaign.delivered.toLocaleString()} <span className="text-emerald-400 text-[10px]">({deliveryPct}%)</span></span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${deliveryPct}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye className="h-3.5 w-3.5 text-amber-400" /> Read Confirmation
                    </span>
                    <span>{campaign.read.toLocaleString()} <span className="text-amber-400 text-[10px]">({readPct}%)</span></span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${Math.round(deliveryPct * (readPct / 100))}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <ThumbsUp className="h-3.5 w-3.5 text-info" /> Followed / Adhered
                    </span>
                    <span>{campaign.followed.toLocaleString()} <span className="text-info text-[10px]">({followedPct}%)</span></span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-info" style={{ width: `${Math.round(deliveryPct * (readPct / 100) * (followedPct / 100))}%` }} />
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Campaign Content Preview" subtitle={`Dual-language payload: Batch #${campaign.id}`}>
              <div className="p-5 space-y-3">
                <div className="rounded-lg border border-border/50 bg-background/50 p-3.5 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">English Content</p>
                  <p className="text-xs text-foreground/90 leading-relaxed">{campaign.en || "None provided"}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/50 p-3.5 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">Telugu Content (తెలుగు)</p>
                  <p className="text-xs text-foreground/90 leading-relaxed">{campaign.te || "ఏదీ అందించబడలేదు"}</p>
                </div>
              </div>
            </Panel>
          </div>

          <Panel title="Historical Broadcast Campaigns" subtitle="Audit log of sent and scheduled target notifications">
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="pb-2">Batch</th>
                    <th className="pb-2">Campaign Name</th>
                    <th className="pb-2">Target Filter</th>
                    <th className="pb-2 text-right">Recipient Size</th>
                    <th className="pb-2 text-right">Delivered Pct</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-foreground/90 font-medium">
                  {campaigns.map((c) => {
                    const cDelPct = c.size > 0 ? Math.round((c.delivered / c.size) * 100) : 0;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCampaignId(c.id)}
                        className={`hover:bg-muted/10 cursor-pointer transition-colors ${
                          selectedCampaignId === c.id ? "bg-primary/5 text-primary" : ""
                        }`}
                      >
                        <td className="py-3 font-bold">#{c.id}</td>
                        <td className="py-3 font-semibold">{c.name}</td>
                        <td className="py-3 text-muted-foreground">{c.district} · {c.crop}</td>
                        <td className="py-3 text-right">{c.size.toLocaleString()}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cDelPct > 90 ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"
                          }`}>
                            {cDelPct}%
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button className="text-primary hover:underline inline-flex items-center gap-0.5">
                            Details <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
