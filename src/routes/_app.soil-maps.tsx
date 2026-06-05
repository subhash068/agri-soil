import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { APMap } from "@/components/maps/APMap";
import { MAP_LAYERS } from "@/lib/mock-data";
import { Map, Search, Layers as LayersIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/soil-maps")({
  head: () => ({ meta: [{ title: "Soil Intelligence Maps — AgriSoil AI" }] }),
  component: SoilMaps,
});

const metricByLayer: Record<string, "soilHealth" | "deficiencyRate" | "groundwaterStress" | "yieldGain"> = {
  Nitrogen: "deficiencyRate",
  Phosphorus: "deficiencyRate",
  Potassium: "deficiencyRate",
  Groundwater: "groundwaterStress",
  "Crop Coverage": "yieldGain",
  "Fertilizer Demand": "deficiencyRate",
};

const boundaries = ["Parcel", "Village", "Mandal", "District"];

function SoilMaps() {
  const [active, setActive] = useState("pH");
  const [year, setYear] = useState(2026);
  const [bnd, setBnd] = useState("District");
  const metric = metricByLayer[active] ?? "soilHealth";
  const invert = metric === "deficiencyRate" || metric === "groundwaterStress";

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Map className="h-5 w-5" />}
        title="Soil Intelligence Maps"
        description="GIS monitoring system · heatmaps, choropleths & historical analysis across 7 districts"
        actions={<Pill tone="info">Sentinel-2 · APSAC</Pill>}
      />

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Layer control */}
        <div className="space-y-4">
          <Panel title="Layer Toggle" subtitle="Select active layer" bodyClassName="space-y-4 p-4">
            {MAP_LAYERS.map((g) => (
              <div key={g.group}>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <LayersIcon className="h-3 w-3" /> {g.group}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {g.layers.map((l) => (
                    <button
                      key={l}
                      onClick={() => setActive(l)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                        active === l
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-card hover:bg-muted",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="Boundaries" bodyClassName="p-4">
            <div className="flex flex-wrap gap-1.5">
              {boundaries.map((b) => (
                <button
                  key={b}
                  onClick={() => setBnd(b)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium",
                    bnd === b ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted",
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Parcel Search" bodyClassName="p-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Survey no / parcel ID"
                className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </Panel>
        </div>

        {/* Map */}
        <div className="space-y-4">
          <Panel
            title={`${active} — ${bnd} Layer`}
            subtitle="Choropleth intelligence layer"
            action={<Pill tone="muted">{year}</Pill>}
          >
            <APMap metricKey={metric} invert={invert} height={460} />
          </Panel>

          <Panel title="Historical Time Slider" bodyClassName="p-5">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                min={2019}
                max={2026}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="flex-1 accent-[var(--color-primary)]"
              />
              <span className="w-12 text-right text-sm font-semibold tabular-nums">{year}</span>
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
                <span key={y}>{y}</span>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
