import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import React, { Suspense } from "react";
const ClientAPMap = React.lazy(() => import("@/components/maps/SoilHealthMap").then(m => ({ default: m.SoilHealthMap })));
import { MAP_LAYERS } from "@/lib/mock-data";
import { Map, Search, Layers as LayersIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { ClientOnly } from "@/components/ClientOnly";

export const Route = createFileRoute("/_app/soil-maps")({
  head: () => ({ meta: [{ title: "Soil Intelligence Maps — AgriSoil AI" }] }),
  component: SoilMaps,
});

function SoilMaps() {
  const [active, setActive] = useState("pH");
  const [year, setYear] = useState(2026);
  const [bnd, setBnd] = useState("District");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  
  const filterDistrict = useAppStore((s) => s.district);
  const filterMandal = useAppStore((s) => s.mandal);
  const filterVillage = useAppStore((s) => s.village);
  const setDistrictStore = useAppStore((s) => s.setDistrict);
  const setMandalStore = useAppStore((s) => s.setMandal);
  const setVillageStore = useAppStore((s) => s.setVillage);

  const handleParcelSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchError("");
      useAppStore.getState().setSearchedParcel(null);
      try {
        const res = await fetch(`http://localhost:8000/parcel/${encodeURIComponent(searchQuery.trim())}`);
        if (!res.ok) throw new Error("Parcel not found");
        const parcel = await res.json();
        
        useAppStore.getState().setSearchedParcel(parcel);
        
        // Auto-fill the selectors to zoom the map
        setDistrictStore(parcel.district || "");
        // Use timeout to ensure state settles before the next selector updates (React 18 batches but just to be safe with cascading dropdowns)
        setTimeout(() => setMandalStore(parcel.mandal || "All Mandals"), 50);
        setTimeout(() => setVillageStore(parcel.village || "All Villages"), 100);
      } catch (err) {
        setSearchError("Parcel not found in DB");
      }
    }
  };

  const { data: districts = [] } = useQuery({
    queryKey: ["districts"],
    queryFn: () => fetch("http://localhost:8000/districts").then(res => res.json()),
  });

  const { data: mandals = [] } = useQuery({
    queryKey: ["mandals", filterDistrict],
    queryFn: () => fetch(`http://localhost:8000/mandals?district=${filterDistrict}`).then(res => res.json()),
    enabled: !!filterDistrict && filterDistrict !== "All Districts",
  });

  const { data: villages = [] } = useQuery({
    queryKey: ["villages", filterDistrict, filterMandal],
    queryFn: () => fetch(`http://localhost:8000/villages?district=${filterDistrict}&mandal=${filterMandal}`).then(res => res.json()),
    enabled: !!filterDistrict && filterDistrict !== "All Districts" && !!filterMandal && filterMandal !== "All Mandals",
  });

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrictStore(e.target.value === "All" ? "" : e.target.value);
  };

  const handleMandalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMandalStore(e.target.value === "All" ? "All Mandals" : e.target.value);
  };

  const metric = active;
  const invert = ["Nitrogen", "Phosphorus", "Potassium", "Soil Unhealthy %", "EC"].includes(active);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Map className="h-5 w-5" />}
        title="Soil Intelligence Maps"
        description="GIS monitoring system · heatmaps, choropleths & historical analysis across 7 districts"
        actions={
          <div className="flex items-center gap-3">
            <select 
              value={filterDistrict || "All"} 
              onChange={handleDistrictChange}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="All">All Districts</option>
              {districts.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
            
            {!!filterDistrict && (
              <select 
                value={filterMandal || "All"} 
                onChange={handleMandalChange}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="All">All Mandals</option>
                {mandals.map((m: string) => <option key={m} value={m}>{m}</option>)}
              </select>
            )}

            {!!filterMandal && filterMandal !== "All Mandals" && (
              <select 
                value={filterVillage} 
                onChange={(e) => setVillageStore(e.target.value === "All Villages" ? "All Villages" : e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="All Villages">All Villages</option>
                {villages.map((v: string) => <option key={v} value={v}>{v}</option>)}
              </select>
            )}

            <Pill tone="info">Sentinel-2 · APSAC</Pill>
          </div>
        }
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





          <Panel title="Parcel Search" bodyClassName="p-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleParcelSearch}
                placeholder="Survey no / parcel ID"
                className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
              {searchError && <p className="text-xs text-destructive mt-1.5 absolute -bottom-5">{searchError}</p>}
            </div>
          </Panel>
        </div>

        {/* Map */}
        <div className="space-y-4">
          <Panel bodyClassName="p-0 border-0">
            <ClientOnly fallback={<div style={{ height: 460, background: "#0a0a0a" }} className="w-full rounded-lg" />}>
              <ClientAPMap metricKey={metric} invert={invert} height={460} />
            </ClientOnly>
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
