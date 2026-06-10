import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import React, { Suspense } from "react";
const APMap = React.lazy(() => import("@/components/maps/CropMap").then(m => ({ default: m.CropMap })));
import { CROPS } from "@/lib/mock-data";
import { Target } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";

export const Route = createFileRoute("/_app/crop-suitability")({
  head: () => ({ meta: [{ title: "Crop Suitability Engine — AgriSoil AI" }] }),
  component: CropSuitability,
});

function CropSuitability() {
  return (
    <div className="space-y-6">
      <PageHeader icon={<Target className="h-5 w-5" />} title="Crop Suitability Engine"
        description="AI suitability scoring by soil, season, water & nutrient profile" actions={<Pill tone="info">Guntur</Pill>} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {CROPS.map((c) => (
            <Panel key={c.name} bodyClassName="p-4">
              <div className="flex items-center justify-between">
                <div><span className="text-sm font-semibold">{c.name}</span> <Pill tone="muted">{c.season}</Pill></div>
                <span className="text-lg font-bold tabular-nums" style={{ color: c.suitability >= 80 ? "var(--color-success)" : c.suitability >= 70 ? "var(--color-warning)" : "var(--color-destructive)" }}>{c.suitability}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${c.suitability}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">N {c.n} · P {c.p} · K {c.k} kg/ha · Stages: {c.stages.join(" → ")}</p>
            </Panel>
          ))}
        </div>
        <Panel title="Suitability Map">
          <ClientOnly fallback={<div style={{ height: 360, background: "#0a0a0a" }} className="w-full rounded-lg" />}>
            <APMap metricKey="yieldGain" height={360} />
          </ClientOnly>
        </Panel>
      </div>
    </div>
  );
}
