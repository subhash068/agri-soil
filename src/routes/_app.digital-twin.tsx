import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { Boxes } from "lucide-react";
export const Route = createFileRoute("/_app/digital-twin")({
  head: () => ({ meta: [{ title: "Soil Digital Twin — AgriSoil AI" }] }),
  component: () => (
    <ModulePage spec={{
      title: "Soil Digital Twin", icon: Boxes, tag: "1 / 3 / 6 months",
      description: "Future soil simulation across No Intervention, Recommended & Alternative scenarios.",
      kpis: [
        { label: "No Intervention", value: "−4 pts", tone: "destructive" },
        { label: "Recommended", value: "+11 pts", tone: "success" },
        { label: "Alternative", value: "+6 pts", tone: "warning" },
        { label: "Horizon", value: "6 months", tone: "info" },
      ],
      insights: [
        "Without intervention, organic carbon drops below 0.4% in 6 months.",
        "Recommended plan restores macro/micro balance within 3 months.",
        "Alternative low-cost plan delivers 55% of recommended gains.",
      ],
    }} />
  ),
});
