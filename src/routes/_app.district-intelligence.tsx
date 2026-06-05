import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { MapPinned } from "lucide-react";
export const Route = createFileRoute("/_app/district-intelligence")({
  head: () => ({ meta: [{ title: "District Intelligence — AgriSoil AI" }] }),
  component: () => (
    <ModulePage spec={{
      title: "District Intelligence", icon: MapPinned, tag: "7 districts",
      description: "District-level soil, nutrient, crop and economic intelligence comparison.",
      kpis: [
        { label: "Top District", value: "East Godavari", tone: "success" },
        { label: "Needs Attention", value: "Anantapur", tone: "destructive" },
        { label: "Avg Adoption", value: "67%", tone: "info", delta: 6.4 },
        { label: "Demand Hotspot", value: "Kurnool", tone: "warning" },
      ],
      insights: [
        "East Godavari leads composite soil health at 79/100.",
        "Anantapur needs urgent zinc + water-stress intervention.",
        "Adoption gap between top and bottom districts narrowed to 32 pts.",
      ],
      showMap: true, mapMetric: "soilHealth",
    }} />
  ),
});
