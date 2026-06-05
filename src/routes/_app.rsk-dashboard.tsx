import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { Building2 } from "lucide-react";
export const Route = createFileRoute("/_app/rsk-dashboard")({
  head: () => ({ meta: [{ title: "RSK Dashboard — AgriSoil AI" }] }),
  component: () => (
    <ModulePage spec={{
      title: "RSK Dashboard", icon: Building2, tag: "Rythu Seva Kendram",
      description: "Assigned farmers, pending advisories, nutrient hotspots & visit planning.",
      kpis: [
        { label: "Assigned Farmers", value: "1,240" },
        { label: "Pending Advisories", value: "86", tone: "warning" },
        { label: "Hotspots", value: "9", tone: "destructive" },
        { label: "Visits Planned", value: "32", tone: "info" },
      ],
      insights: [
        "Prioritise 9 zinc-critical hotspots in Tadikonda & Pedakakani.",
        "86 advisories pending farmer acknowledgement — schedule field visits.",
        "Adoption in your RSK is 6.4% above mandal average.",
      ],
      showMap: true, mapMetric: "adoption",
    }} />
  ),
});
