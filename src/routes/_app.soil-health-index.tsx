import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Gauge } from "@/components/ui-kit/Gauge";
import { AreaTrend, RadarStat } from "@/components/charts/Charts";
import { APMap } from "@/components/maps/APMap";
import { HEALTH_COMPONENTS, soilHealthTrend, healthCategory, CATEGORY_COLOR, districtRanking } from "@/lib/mock-data";
import { HeartPulse } from "lucide-react";

export const Route = createFileRoute("/_app/soil-health-index")({
  head: () => ({ meta: [{ title: "Unified Soil Health Index — AgriSoil AI" }] }),
  component: SoilHealthIndex,
});

function SoilHealthIndex() {
  const score = Math.round(HEALTH_COMPONENTS.reduce((a, c) => a + c.score, 0) / HEALTH_COMPONENTS.length);
  const cat = healthCategory(score);
  const ranking = districtRanking();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<HeartPulse className="h-5 w-5" />}
        title="Unified Soil Health Index"
        description="Composite 0–100 score from pH, EC, organic carbon, macro/micronutrients, soil type & water availability"
        actions={<Pill tone="success">{cat}</Pill>}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="USHI Score" subtitle="Selected region composite">
          <div className="flex flex-col items-center">
            <Gauge value={score} label={cat} color={CATEGORY_COLOR[cat]} />
            <div className="mt-2 grid w-full grid-cols-5 gap-1 text-center text-[9px]">
              {(["Critical", "Poor", "Moderate", "Good", "Excellent"] as const).map((c) => (
                <span key={c} className="rounded px-1 py-0.5 text-white" style={{ background: CATEGORY_COLOR[c] }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Component Breakdown" subtitle="7 sub-indices" className="lg:col-span-2">
          <RadarStat data={HEALTH_COMPONENTS} />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Component Scores">
          <div className="space-y-3">
            {HEALTH_COMPONENTS.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-32 text-xs font-medium">{c.name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.score}%`, background: CATEGORY_COLOR[healthCategory(c.score)] }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-semibold tabular-nums">{c.score}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="USHI Trend" subtitle="12-month rolling average">
          <AreaTrend data={soilHealthTrend} keys={[{ key: "score", color: "var(--color-primary)" }]} />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="USHI GIS Layer" className="lg:col-span-2">
          <APMap metricKey="soilHealth" height={340} />
        </Panel>
        <Panel title="District Rankings">
          <ol className="space-y-2">
            {ranking.map((d, i) => (
              <li key={d.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span className="text-sm font-medium">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {d.name}
                </span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: CATEGORY_COLOR[healthCategory(d.soilHealth)] }}>
                  {d.soilHealth}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}
