import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { NUTRIENT_PREDICTIONS, SEVERITY_COLOR } from "@/lib/mock-data";
import { Brain } from "lucide-react";

export const Route = createFileRoute("/_app/nutrient-prediction")({
  head: () => ({ meta: [{ title: "Nutrient Prediction Center — AgriSoil AI" }] }),
  component: NutrientPrediction,
});

function NutrientPrediction() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Brain className="h-5 w-5" />}
        title="Nutrient Prediction Center"
        description="AI predictions from Sentinel-2, Planet imagery, Soil Health Cards, APSAC maps, weather & groundwater"
        actions={<Pill tone="info">Model v4.2 · ensemble</Pill>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {NUTRIENT_PREDICTIONS.map((n) => (
          <Panel key={n.key} bodyClassName="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{n.name}</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: SEVERITY_COLOR[n.severity] }}>
                {n.severity}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {n.value}
              <span className="ml-1 text-sm font-medium text-muted-foreground">{n.unit}</span>
            </p>
            <p className="text-xs text-muted-foreground">Range {n.low}–{n.high} {n.unit}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-semibold">{n.confidence}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${n.confidence}%` }} />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Optimal {n.optimal[0]}–{n.optimal[1]} {n.unit}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
