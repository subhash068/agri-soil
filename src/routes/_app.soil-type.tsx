import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Donut, Bars } from "@/components/charts/Charts";
import { Mountain, Droplets, Layers, Leaf, Database, FlaskConical, BarChart3 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { GeographicFilter } from "@/components/GeographicFilter";

interface SoilTypeAPI {
  id: string;
  name: string;
  water_holding_capacity: number;
  drainage: string;
  texture: string;
  retention_score: number;
  suitable_crops: string[];
  color: string;
  parcel_count: number;
  share: number;
}

export const Route = createFileRoute("/_app/soil-type")({
  head: () => ({ meta: [{ title: "Soil Type Intelligence — AgriSoil AI" }] }),
  component: SoilTypePage,
});

function SoilTypePage() {
  const { district, mandal, village } = useAppStore();

  const { data: soilTypes = [], isLoading } = useQuery<SoilTypeAPI[]>({
    queryKey: ["soil-types", district, mandal, village],
    queryFn: () => {
      const params = new URLSearchParams();
      if (district && district !== "All Districts") params.append("district", district);
      if (mandal && mandal !== "All Mandals") params.append("mandal", mandal);
      if (village && village !== "All Villages") params.append("village", village);
      return fetch(`http://localhost:8000/soil-types?${params.toString()}`).then(r => r.json());
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["soil-analytics", district, mandal, village],
    queryFn: () => {
      const params = new URLSearchParams();
      if (district && district !== "All Districts") params.append("district", district);
      if (mandal && mandal !== "All Mandals") params.append("mandal", mandal);
      if (village && village !== "All Villages") params.append("village", village);
      return fetch(`http://localhost:8000/soil-types/analytics?${params.toString()}`).then(r => r.json());
    },
  });

  const totalParcels = soilTypes.reduce((s, t) => s + t.parcel_count, 0);
  const activeTypes = soilTypes.filter(s => s.parcel_count > 0);
  const allTypes = soilTypes;

  // Color palette for chart — use the DB-stored CSS vars, with fallbacks
  const CHART_COLORS = [
    "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)",
    "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-chart-6)",
    "#6366f1", "#f59e0b", "#14b8a6", "#ef4444", "#8b5cf6",
  ];

  // Drainage icon lookup
  const drainageIcon = (d: string) => {
    if (d === "Poor") return "🔴";
    if (d === "Excessive") return "🟡";
    if (d === "Moderate") return "🟠";
    return "🟢";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Mountain className="h-5 w-5" />}
        title="Soil Type Intelligence"
        description={
          district && district !== "All Districts"
            ? `Classification & agronomic properties — ${district}`
            : "Classification & agronomic properties of Andhra Pradesh soils"
        }
        actions={
          <div className="flex items-center gap-3">
            <GeographicFilter />
            <Pill tone="info">{allTypes.length} classes</Pill>
            {totalParcels > 0 && <Pill tone="success">{totalParcels.toLocaleString("en-IN")} parcels</Pill>}
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Soil Distribution" subtitle="loading...">
            <div className="flex items-center justify-center h-48">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="h-32 w-32 rounded-full bg-muted/40" />
                <p className="text-xs text-muted-foreground">Loading soil data…</p>
              </div>
            </div>
          </Panel>
          <div className="space-y-4 lg:col-span-2">
            {[1, 2, 3].map(i => (
              <Panel key={i} bodyClassName="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-40 bg-muted/40 rounded" />
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(j => <div key={j} className="h-14 bg-muted/30 rounded" />)}
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Summary Row */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
            <div className="rounded-lg border border-border/60 bg-card p-3 flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2"><Database className="h-4 w-4 text-primary" /></div>
              <div><p className="text-[11px] text-muted-foreground">Total Types</p><p className="text-lg font-bold">{allTypes.length}</p></div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3 flex items-center gap-3">
              <div className="rounded-md bg-emerald-500/10 p-2"><Layers className="h-4 w-4 text-emerald-500" /></div>
              <div><p className="text-[11px] text-muted-foreground">Active in Parcels</p><p className="text-lg font-bold">{activeTypes.length}</p></div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3 flex items-center gap-3">
              <div className="rounded-md bg-blue-500/10 p-2"><BarChart3 className="h-4 w-4 text-blue-500" /></div>
              <div><p className="text-[11px] text-muted-foreground">Total Parcels</p><p className="text-lg font-bold">{totalParcels.toLocaleString("en-IN")}</p></div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3 flex items-center gap-3">
              <div className="rounded-md bg-amber-500/10 p-2"><Droplets className="h-4 w-4 text-amber-500" /></div>
              <div>
                <p className="text-[11px] text-muted-foreground">Avg Water Hold</p>
                <p className="text-lg font-bold">
                  {activeTypes.length > 0
                    ? Math.round(activeTypes.reduce((s, t) => s + t.water_holding_capacity * t.parcel_count, 0) / totalParcels)
                    : Math.round(allTypes.reduce((s, t) => s + t.water_holding_capacity, 0) / (allTypes.length || 1))
                  }%
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3 flex items-center gap-3">
              <div className="rounded-md bg-violet-500/10 p-2"><FlaskConical className="h-4 w-4 text-violet-500" /></div>
              <div>
                <p className="text-[11px] text-muted-foreground">Avg Retention</p>
                <p className="text-lg font-bold">
                  {activeTypes.length > 0
                    ? Math.round(activeTypes.reduce((s, t) => s + t.retention_score * t.parcel_count, 0) / totalParcels)
                    : Math.round(allTypes.reduce((s, t) => s + t.retention_score, 0) / (allTypes.length || 1))
                  }%
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3 flex items-center gap-3">
              <div className="rounded-md bg-rose-500/10 p-2"><Leaf className="h-4 w-4 text-rose-500" /></div>
              <div>
                <p className="text-[11px] text-muted-foreground">Dominant Type</p>
                <p className="text-lg font-bold truncate">
                  {activeTypes.length > 0 ? activeTypes[0].name : allTypes[0]?.name || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Donut chart */}
            <Panel title="Soil Distribution" subtitle={`${activeTypes.length} active types · ${totalParcels.toLocaleString("en-IN")} parcels`}>
              <Donut
                data={(activeTypes.length > 0 ? activeTypes : allTypes).map((s, i) => ({
                  name: s.name,
                  value: s.share > 0 ? s.share : Math.round(100 / allTypes.length),
                  color: s.color.startsWith("var") ? s.color : CHART_COLORS[i % CHART_COLORS.length],
                }))}
              />
              {/* Legend with parcel counts */}
              {activeTypes.length > 0 && (
                <div className="mt-3 space-y-1.5 px-2">
                  {activeTypes.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-sm shrink-0"
                          style={{ background: s.color.startsWith("var") ? s.color : CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-mono font-medium tabular-nums">{s.parcel_count.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Soil type cards */}
            <div className="space-y-4 lg:col-span-2 max-h-[600px] overflow-y-auto pr-2">
              {allTypes.map((s, idx) => (
                <Panel key={s.id} bodyClassName="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="h-3 w-3 rounded-sm shrink-0"
                      style={{ background: s.color.startsWith("var") ? s.color : CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <span className="text-sm font-semibold">{s.name}</span>
                    {s.share > 0 && <Pill tone="muted">{s.share}% area</Pill>}
                    {s.parcel_count > 0 && (
                      <Pill tone="success">{s.parcel_count.toLocaleString("en-IN")} parcels</Pill>
                    )}
                    {s.parcel_count === 0 && <Pill tone="warning">Reference only</Pill>}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div className="rounded bg-muted/60 p-2">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Droplets className="h-3 w-3" /> Water Holding
                      </p>
                      <p className="font-semibold">{s.water_holding_capacity}%</p>
                    </div>
                    <div className="rounded bg-muted/60 p-2">
                      <p className="text-muted-foreground">Drainage</p>
                      <p className="font-semibold">{drainageIcon(s.drainage)} {s.drainage}</p>
                    </div>
                    <div className="rounded bg-muted/60 p-2">
                      <p className="text-muted-foreground">Texture</p>
                      <p className="font-semibold">{s.texture}</p>
                    </div>
                    <div className="rounded bg-muted/60 p-2">
                      <p className="text-muted-foreground">Retention</p>
                      <p className="font-semibold">{s.retention_score}%</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Best crops: <span className="font-medium text-foreground">{s.suitable_crops.join(", ")}</span>
                  </p>
                </Panel>
              ))}
            </div>
          </div>

          {/* Analytics Section */}
          {analytics && Object.keys(analytics.nutrients).length > 0 && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Nutrient Profile by Soil Type" subtitle="Average NPK levels (kg/ha)">
                <div className="h-72">
                  <Bars 
                    data={Object.entries(analytics.nutrients).map(([soil, data]: [string, any]) => ({
                      name: soil,
                      Nitrogen: data.avg_n,
                      Phosphorus: data.avg_p,
                      Potassium: data.avg_k
                    }))}
                    xKey="name"
                    keys={[
                      { key: "Nitrogen", color: "#6366f1" },
                      { key: "Phosphorus", color: "#f59e0b" },
                      { key: "Potassium", color: "#14b8a6" }
                    ]}
                    height={280}
                    xAxisLabel="Soil Classification"
                    yAxisLabel="Nutrients (kg/ha)"
                  />
                </div>
              </Panel>
              
              <Panel title="Irrigation Distribution" subtitle="Top methods per soil type">
                <div className="space-y-4 p-4">
                  {Object.entries(analytics.irrigation).slice(0, 4).map(([soil, methods]: [string, any]) => {
                    const topMethod = Object.entries(methods).sort((a: any, b: any) => b[1] - a[1])[0];
                    return (
                      <div key={soil} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-sm">{soil}</p>
                          <p className="text-xs text-muted-foreground">Most common: {topMethod ? String(topMethod[0]) : "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{topMethod ? Number(topMethod[1]) : 0}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Parcels</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
