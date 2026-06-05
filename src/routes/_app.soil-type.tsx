import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Donut } from "@/components/charts/Charts";
import { SOIL_TYPES } from "@/lib/mock-data";
import { Mountain } from "lucide-react";

export const Route = createFileRoute("/_app/soil-type")({
  head: () => ({ meta: [{ title: "Soil Type Intelligence — AgriSoil AI" }] }),
  component: SoilTypePage,
});

function SoilTypePage() {
  return (
    <div className="space-y-6">
      <PageHeader icon={<Mountain className="h-5 w-5" />} title="Soil Type Intelligence"
        description="Classification & agronomic properties of Andhra Pradesh soils" actions={<Pill tone="info">5 classes</Pill>} />
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Soil Distribution" subtitle="% area share">
          <Donut data={SOIL_TYPES.map((s) => ({ name: s.name, value: s.share, color: s.color }))} />
        </Panel>
        <div className="space-y-4 lg:col-span-2">
          {SOIL_TYPES.map((s) => (
            <Panel key={s.name} bodyClassName="p-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
                <span className="text-sm font-semibold">{s.name}</span>
                <Pill tone="muted">{s.share}% area</Pill>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded bg-muted/60 p-2"><p className="text-muted-foreground">Water Holding</p><p className="font-semibold">{s.waterHolding}%</p></div>
                <div className="rounded bg-muted/60 p-2"><p className="text-muted-foreground">Drainage</p><p className="font-semibold">{s.drainage}</p></div>
                <div className="rounded bg-muted/60 p-2"><p className="text-muted-foreground">Texture</p><p className="font-semibold">{s.texture}</p></div>
                <div className="rounded bg-muted/60 p-2"><p className="text-muted-foreground">Retention</p><p className="font-semibold">{s.retention}%</p></div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Best crops: <span className="font-medium text-foreground">{s.crops.join(", ")}</span></p>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
