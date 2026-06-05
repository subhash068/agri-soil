import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { CROPS } from "@/lib/mock-data";
import { Sprout } from "lucide-react";

export const Route = createFileRoute("/_app/crop-intelligence")({
  head: () => ({ meta: [{ title: "Crop Intelligence — AgriSoil AI" }] }),
  component: CropIntelligence,
});

function CropIntelligence() {
  return (
    <div className="space-y-6">
      <PageHeader icon={<Sprout className="h-5 w-5" />} title="Crop Intelligence"
        description="Nutrient requirements, growth stages, calendar & fertilizer schedule" actions={<Pill tone="info">4 crops</Pill>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {CROPS.map((c) => (
          <Panel key={c.name} title={c.name} subtitle={`${c.season} season`} bodyClassName="space-y-3 p-5">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded bg-muted/60 p-2"><p className="text-muted-foreground">Nitrogen</p><p className="text-base font-bold">{c.n}</p></div>
              <div className="rounded bg-muted/60 p-2"><p className="text-muted-foreground">Phosphorus</p><p className="text-base font-bold">{c.p}</p></div>
              <div className="rounded bg-muted/60 p-2"><p className="text-muted-foreground">Potassium</p><p className="text-base font-bold">{c.k}</p></div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Growth Stages</p>
              <div className="flex flex-wrap items-center gap-1">
                {c.stages.map((s, i) => (
                  <span key={s} className="flex items-center gap-1">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{s}</span>
                    {i < c.stages.length - 1 && <span className="text-muted-foreground">→</span>}
                  </span>
                ))}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
