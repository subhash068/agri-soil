import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Bars } from "@/components/charts/Charts";
import { districtRanking, fertilizerDemand, SEVERITY_COLOR, HOTSPOTS } from "@/lib/mock-data";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_app/aprtgs-dashboard")({
  head: () => ({ meta: [{ title: "APRTGS Dashboard — AgriSoil AI" }] }),
  component: Aprtgs,
});

function Aprtgs() {
  const ranking = districtRanking();
  return (
    <div className="space-y-6">
      <PageHeader icon={<ShieldCheck className="h-5 w-5" />} title="APRTGS Monitoring Dashboard"
        description="District & mandal rankings, nutrient crisis alerts, adoption & demand forecasts" actions={<Pill tone="info">State-wide</Pill>} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="District Rankings" subtitle="Soil health & adoption">
          <div className="space-y-2.5">
            {ranking.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
                <span className="w-28 text-sm font-medium">{d.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${d.adoption}%` }} /></div>
                <span className="w-12 text-right text-xs font-semibold tabular-nums">{d.adoption}%</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Nutrient Crisis Alerts">
          <ul className="space-y-2">
            {HOTSPOTS.map((h) => (
              <li key={h.district + h.nutrient} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <span className="text-sm font-medium">{h.district} · {h.nutrient}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: SEVERITY_COLOR[h.severity] }}>{h.severity}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Fertilizer Demand Forecast" subtitle="State-wide '000 MT">
        <Bars data={fertilizerDemand} xKey="month" stacked keys={[{ key: "Urea", color: "var(--color-chart-1)" }, { key: "DAP", color: "var(--color-chart-2)" }, { key: "MOP", color: "var(--color-chart-3)" }, { key: "Micronutrients", color: "var(--color-chart-4)" }]} />
      </Panel>
    </div>
  );
}
