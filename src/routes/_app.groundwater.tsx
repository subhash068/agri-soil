import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { Droplets } from "lucide-react";
import React from "react";
const SoilHealthMap = React.lazy(() => import("@/components/maps/SoilHealthMap").then(m => ({ default: m.SoilHealthMap })));

export const Route = createFileRoute("/_app/groundwater")({
  head: () => ({ meta: [{ title: "Groundwater Intelligence — AgriSoil AI" }] }),
  component: () => (
    <ModulePage spec={{
      title: "Groundwater Intelligence", icon: Droplets, tag: "Water Stress Index",
      description: "Water table depth, recharge status, borewell density & irrigation availability.",
      kpis: [
        { label: "Avg Water Table", value: "18.4 m", tone: "warning" },
        { label: "Recharge Status", value: "Deficit", tone: "destructive" },
        { label: "Borewell Density", value: "High", tone: "warning" },
        { label: "Stress Index", value: "Severe", tone: "destructive", delta: 2.3 },
      ],
      insights: [
        "Anantapur & Kurnool at severe water stress — restrict paddy expansion.",
        "Godavari delta has stable recharge supporting intensive cropping.",
        "Promote micro-irrigation in high borewell-density mandals.",
      ],
      showMap: true, mapMetric: "groundwaterStress",
      mapComponent: <SoilHealthMap metricKey="groundwaterStress" invert={true} height={380} />
    }} />
  ),
});
