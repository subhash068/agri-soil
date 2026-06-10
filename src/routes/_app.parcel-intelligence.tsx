import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ModulePage } from "@/components/ModulePage";
import { Layers } from "lucide-react";

import React from "react";
const ParcelMap = React.lazy(() => import("@/components/maps/ParcelMap").then(m => ({ default: m.ParcelMap })));

export const Route = createFileRoute("/_app/parcel-intelligence")({
  head: () => ({ meta: [{ title: "Parcel Intelligence — AgriSoil AI" }] }),
  component: ParcelIntelligence,
});

function ParcelIntelligence() {
  const { data: kpiData } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: () => fetch("http://localhost:8000/dashboard/kpis").then(r => r.json()),
  });

  const parcelsCount = kpiData?.parcels_monitored || 498210;
  const avgHealth = kpiData?.healthy_crop_percent || 64;
  const flagged = kpiData?.active_stress_alerts || 41820;

  const fmt = (n: number) => n.toLocaleString("en-IN");

  return (
    <ModulePage spec={{
      title: "Parcel Intelligence", icon: Layers, tag: `${fmt(parcelsCount)} parcels`,
      description: "Parcel-level soil health, crop suitability, and nutrient intelligence.",
      kpis: [
        { label: "Total Parcels", value: fmt(parcelsCount), delta: 1.2 },
        { label: "Avg Soil Health (%)", value: `${avgHealth}%`, tone: "success", delta: 2.1 },
        { label: "Parcels with Unhealthy Soil", value: fmt(flagged), tone: "warning", delta: -0.5 },
        { label: "Avg Organic Carbon", value: "0.85%", tone: "info" },
      ],
      insights: [
        "High salinity (EC) detected in coastal district parcels affecting crop yield.",
        "Nitrogen (N) and Phosphorus (P) deficiency observed in Sandy Loam soil types.",
        "Average Soil Health % across monitored parcels improved by 2.1% this season.",
      ],
      showMap: true, mapMetric: "soilHealth",
      mapComponent: <ParcelMap metricKey="soilHealth" showParcels={true} height={380} />
    }} />
  );
}
