import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { Layers } from "lucide-react";
export const Route = createFileRoute("/_app/parcel-intelligence")({
  head: () => ({ meta: [{ title: "Parcel Intelligence — AgriSoil AI" }] }),
  component: () => (
    <ModulePage spec={{
      title: "Parcel Intelligence", icon: Layers, tag: "500K parcels",
      description: "Parcel-level soil, nutrient and crop intelligence with confidence scoring.",
      kpis: [
        { label: "Parcels Mapped", value: "498,210", delta: 2.8 },
        { label: "Avg Parcel Health", value: "64/100", tone: "success", delta: 3.1 },
        { label: "Geo-tagged %", value: "96.4%", tone: "info" },
        { label: "Flagged Parcels", value: "41,820", tone: "warning", delta: -1.2 },
      ],
      insights: [
        "12% of parcels show declining organic carbon over 3 seasons.",
        "Coastal parcels in East Godavari flagged for rising salinity (EC).",
        "Parcel boundary accuracy improved to 96.4% after Sentinel-2 re-survey.",
      ],
      showMap: true, mapMetric: "soilHealth",
    }} />
  ),
});
