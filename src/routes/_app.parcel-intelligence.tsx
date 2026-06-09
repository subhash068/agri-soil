import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Kpi } from "@/components/ui-kit/Kpi";
import { Panel } from "@/components/ui-kit/Panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppStore } from "@/lib/store";
import { Layers, MapPinned, HeartPulse, ShieldAlert, BadgeCheck, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/parcel-intelligence")({
  head: () => ({ meta: [{ title: "Parcel Intelligence — AgriSoil AI" }] }),
  component: ParcelIntelligence,
});

function ParcelIntelligence() {
  const district = useAppStore((s) => s.district);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ["parcels", district],
    queryFn: async () => {
      const d = district === "All Districts" || !district ? "" : `?district=${encodeURIComponent(district === "Anantapur" ? "Ananthapuram" : district)}`;
      const res = await fetch(`http://localhost:8000/parcels${d}`);
      return res.json();
    },
  });

  const filtered = parcels.filter((p: any) => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.village.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const displayParcels = filtered.slice(0, 50);

  const avgHealth = parcels.length 
    ? (parcels.reduce((sum: number, p: any) => sum + p.health, 0) / parcels.length).toFixed(1) 
    : "0";

  const highRisk = parcels.filter((p: any) => p.risk === "High").length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Layers className="h-5 w-5" />}
        title="Parcel Intelligence"
        description={`Parcel-level soil, nutrient and crop intelligence · Focus: ${district}`}
        actions={<Pill tone="info">{parcels.length} parcels</Pill>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi index={0} label="Parcels Found" value={parcels.length.toLocaleString()} icon={MapPinned} tone="default" />
        <Kpi index={1} label="Avg Parcel Health" value={`${avgHealth}/100`} icon={HeartPulse} tone="success" />
        <Kpi index={2} label="High Risk Parcels" value={highRisk.toLocaleString()} icon={ShieldAlert} tone="destructive" />
        <Kpi index={3} label="Geo-tagged" value="100%" icon={BadgeCheck} tone="info" />
      </div>

      <Panel title="Parcel Explorer" subtitle="View and search high-resolution parcel data">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search by Parcel ID, Farmer, or Village..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading parcel data...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcel ID</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Crop</TableHead>
                <TableHead className="text-right">Acreage</TableHead>
                <TableHead className="text-right">Health Score</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayParcels.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-xs">{p.id}</TableCell>
                  <TableCell>{p.farmer}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.village}, {p.mandal}
                  </TableCell>
                  <TableCell>{p.crop}</TableCell>
                  <TableCell className="text-right">{p.acreage} ac</TableCell>
                  <TableCell className="text-right">
                    <span className={p.health >= 80 ? "text-[var(--color-success)] font-semibold" : p.health >= 60 ? "text-[var(--color-warning)] font-semibold" : "text-[var(--color-destructive)] font-semibold"}>
                      {p.health}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.risk === "Low" ? "bg-[var(--color-success)]/15 text-[var(--color-success)]" : 
                      p.risk === "Medium" ? "bg-[var(--color-warning)]/15 text-[var(--color-warning)]" : 
                      "bg-[var(--color-destructive)]/15 text-[var(--color-destructive)]"
                    }`}>
                      {p.risk}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No parcels found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        {filtered.length > 50 && (
          <div className="p-3 text-center text-xs text-muted-foreground border-t border-border">
            Showing 50 of {filtered.length} matching parcels. Use search or filters to narrow down.
          </div>
        )}
      </Panel>
    </div>
  );
}
