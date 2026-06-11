import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { AlertTriangle } from "lucide-react";
import React from "react";
import { useQuery } from "@tanstack/react-query";

const NutrientMap = React.lazy(() => import("@/components/maps/NutrientMap").then(m => ({ default: m.NutrientMap })));

export const Route = createFileRoute("/_app/deficiency-analytics")({
  head: () => ({ meta: [{ title: "Deficiency Severity Analytics — AgriSoil AI" }] }),
  component: DeficiencyAnalytics,
});

function DeficiencyAnalytics() {
  const { data: analytics } = useQuery({
    queryKey: ["deficiency-analytics"],
    queryFn: () => fetch("/api/deficiency/analytics").then(res => res.json())
  });

  const kpis = analytics?.kpis || {
    critical: 22140,
    severe: 48900,
    moderate: 91300,
    normal_pct: 61.0
  };

  const insights = analytics?.insights || [
    "Anantapur leads zinc-critical hotspots with 8,420 parcels.",
    "Phosphorus severity rising in Prakasam red-soil belt.",
    "Boron moderate deficiency clustered around NTR black-soil zones.",
  ];

  return (
    <ModulePage spec={{
      title: "Deficiency Severity Analytics", icon: AlertTriangle, tag: "Normal → Critical",
      description: "Severity classification, hotspot analytics & district rankings for nutrient deficiencies.",
      kpis: [
        { label: "Critical Parcels", value: kpis.critical.toLocaleString(), tone: "destructive", delta: 1.4 },
        { label: "Severe", value: kpis.severe.toLocaleString(), tone: "warning" },
        { label: "Moderate", value: kpis.moderate.toLocaleString(), tone: "info" },
        { label: "Normal", value: `${kpis.normal_pct}%`, tone: "success", delta: 2.2 },
      ],
      insights: insights,
      showMap: true, mapMetric: "deficiencyRate",
      mapComponent: <NutrientMap metricKey="deficiencyRate" invert={true} height={380} />
    }} />
  );
}
