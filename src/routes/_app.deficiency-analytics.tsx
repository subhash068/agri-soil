import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { AlertTriangle } from "lucide-react";
import React from "react";
const NutrientMap = React.lazy(() => import("@/components/maps/NutrientMap").then(m => ({ default: m.NutrientMap })));

export const Route = createFileRoute("/_app/deficiency-analytics")({
  head: () => ({ meta: [{ title: "Deficiency Severity Analytics — AgriSoil AI" }] }),
  component: () => (
    <ModulePage spec={{
      title: "Deficiency Severity Analytics", icon: AlertTriangle, tag: "Normal → Critical",
      description: "Severity classification, hotspot analytics & district rankings for nutrient deficiencies.",
      kpis: [
        { label: "Critical Parcels", value: "22,140", tone: "destructive", delta: 1.4 },
        { label: "Severe", value: "48,900", tone: "warning" },
        { label: "Moderate", value: "91,300", tone: "info" },
        { label: "Normal", value: "61%", tone: "success", delta: 2.2 },
      ],
      insights: [
        "Anantapur leads zinc-critical hotspots with 8,420 parcels.",
        "Phosphorus severity rising in Prakasam red-soil belt.",
        "Boron moderate deficiency clustered around NTR black-soil zones.",
      ],
      showMap: true, mapMetric: "deficiencyRate",
      mapComponent: <NutrientMap metricKey="deficiencyRate" invert={true} height={380} />
    }} />
  ),
});
