import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { FlaskConical } from "lucide-react";
import React from "react";
const NutrientMap = React.lazy(() => import("@/components/maps/NutrientMap").then(m => ({ default: m.NutrientMap })));

export const Route = createFileRoute("/_app/nutrient-availability")({
  head: () => ({ meta: [{ title: "Nutrient Availability Engine — AgriSoil AI" }] }),
  component: () => (
    <ModulePage spec={{
      title: "Nutrient Availability Engine", icon: FlaskConical, tag: "pH/EC/OC aware",
      description: "Plant-available nutrients computed from pH, EC, organic carbon, moisture & soil type.",
      kpis: [
        { label: "Available N", value: "168 kg/ha", tone: "warning" },
        { label: "Available P", value: "14 kg/ha", tone: "destructive" },
        { label: "Available K", value: "298 kg/ha", tone: "success" },
        { label: "Available Zn", value: "0.31 ppm", tone: "destructive" },
      ],
      insights: [
        "High pH (7.4) is reducing phosphorus & zinc availability through fixation.",
        "Only 80% of soil N is plant-available due to low organic carbon.",
        "Apply zinc as foliar spray to bypass soil fixation in alkaline parcels.",
      ],
      showMap: true, mapMetric: "deficiencyRate",
      mapComponent: <NutrientMap metricKey="deficiencyRate" invert={true} height={380} />
    }} />
  ),
});
