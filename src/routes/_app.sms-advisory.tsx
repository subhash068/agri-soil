import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { Send, CheckCheck, Eye, ThumbsUp } from "lucide-react";

export const Route = createFileRoute("/_app/sms-advisory")({
  head: () => ({ meta: [{ title: "SMS Advisory Center — AgriSoil AI" }] }),
  component: SmsAdvisory,
});

const templates = [
  { en: "AgriSoil: Your soil is Zinc-deficient. Apply 25kg Zinc Sulphate/ha at sowing. Expected +7% yield.", te: "అగ్రిసాయిల్: మీ నేలలో జింక్ లోపం. విత్తే సమయంలో హెక్టారుకు 25కిలోల జింక్ సల్ఫేట్ వేయండి. +7% దిగుబడి." },
  { en: "AgriSoil: Split urea — reduce 2nd dose by 20%. Save ₹600/ha. Rain expected, delay top-dressing 3 days.", te: "అగ్రిసాయిల్: యూరియాను విభజించండి — 2వ మోతాదు 20% తగ్గించండి. ₹600 ఆదా. వర్షం, 3 రోజులు ఆలస్యం." },
];

function SmsAdvisory() {
  return (
    <div className="space-y-6">
      <PageHeader icon={<Send className="h-5 w-5" />} title="SMS Advisory Center"
        description="Bilingual SMS delivery tracking — Sent · Delivered · Read · Followed" actions={<Pill tone="success">98.2% delivery</Pill>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi index={0} label="Sent" value="284,500" icon={Send} />
        <Kpi index={1} label="Delivered" value="279,400" icon={CheckCheck} tone="info" delta={1.2} />
        <Kpi index={2} label="Read" value="198,200" icon={Eye} tone="warning" />
        <Kpi index={3} label="Followed" value="141,800" icon={ThumbsUp} tone="success" delta={6.4} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {templates.map((t, i) => (
          <Panel key={i} title={`Template ${i + 1}`} bodyClassName="space-y-3 p-5">
            <div className="rounded-md bg-muted/60 p-3"><p className="text-[11px] font-semibold text-muted-foreground">English</p><p className="text-sm">{t.en}</p></div>
            <div className="rounded-md bg-muted/60 p-3"><p className="text-[11px] font-semibold text-muted-foreground">తెలుగు</p><p className="text-sm">{t.te}</p></div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
