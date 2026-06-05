import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { CalendarRange } from "lucide-react";
export const Route = createFileRoute("/_app/seasonal-intelligence")({
  head: () => ({ meta: [{ title: "Seasonal Intelligence — AgriSoil AI" }] }),
  component: () => (
    <ModulePage spec={{
      title: "Seasonal Intelligence", icon: CalendarRange, tag: "Kharif · Rabi · Summer",
      description: "Season-aware recommendations varying by crop, weather and groundwater.",
      kpis: [
        { label: "Active Season", value: "Kharif 2026", tone: "success" },
        { label: "Sowing Window", value: "Jun–Jul", tone: "info" },
        { label: "Rainfall Forecast", value: "Above normal", tone: "success" },
        { label: "Advisories Issued", value: "12,480", delta: 8.1 },
      ],
      insights: [
        "Kharif: prioritise paddy & cotton in alluvial/black soils with assured irrigation.",
        "Rabi: shift water-stressed Anantapur parcels to groundnut & pulses.",
        "Summer: restrict paddy where groundwater stress exceeds 70.",
      ],
      chart: "bars",
    }} />
  ),
});
