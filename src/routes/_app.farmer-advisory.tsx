import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Gauge } from "@/components/ui-kit/Gauge";
import { NUTRIENT_PREDICTIONS, FERT_RECS, SEVERITY_COLOR } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { MessageSquareHeart } from "lucide-react";

export const Route = createFileRoute("/_app/farmer-advisory")({
  head: () => ({ meta: [{ title: "Farmer Advisory Center — AgriSoil AI" }] }),
  component: FarmerAdvisory,
});

const T = {
  en: { title: "Farmer Advisory Center", health: "Your Soil Health", def: "Key Deficiencies", rec: "Recommendations", impact: "Yield Impact" },
  te: { title: "రైతు సలహా కేంద్రం", health: "మీ నేల ఆరోగ్యం", def: "ముఖ్య లోపాలు", rec: "సిఫార్సులు", impact: "దిగుబడి ప్రభావం" },
};

function FarmerAdvisory() {
  const lang = useAppStore((s) => s.lang);
  const t = T[lang];
  const defs = NUTRIENT_PREDICTIONS.filter((n) => ["Severe", "Critical", "Moderate"].includes(n.severity));
  return (
    <div className="space-y-6">
      <PageHeader icon={<MessageSquareHeart className="h-5 w-5" />} title={t.title}
        description="K. Ramaiah · Tadikonda · Cotton · 2.4 acres" actions={<Pill tone="info">{lang === "en" ? "English" : "తెలుగు"}</Pill>} />
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title={t.health}><div className="flex justify-center"><Gauge value={61} label="Moderate" color="var(--color-warning)" /></div></Panel>
        <Panel title={t.def} className="lg:col-span-2">
          <ul className="space-y-2">
            {defs.map((d) => (
              <li key={d.key} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span className="text-sm font-medium">{d.name} · {d.value}{d.unit}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: SEVERITY_COLOR[d.severity] }}>{d.severity}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title={t.rec}>
        <div className="grid gap-3 sm:grid-cols-2">
          {FERT_RECS.map((f) => (
            <div key={f.name} className="rounded-md border border-border p-3">
              <p className="text-sm font-semibold">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.dosage} · {f.timing}</p>
              <p className="mt-1 text-xs text-success">{t.impact}: +{f.yieldGain}%</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
