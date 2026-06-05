import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { TrendingUp } from "lucide-react";
export const Route = createFileRoute("/_app/yield-simulator")({
  head: () => ({ meta: [{ title: "Yield Impact Simulator — AgriSoil AI" }] }),
  component: () => (
    <ModulePage spec={{
      title: "Yield Impact Simulator", icon: TrendingUp, tag: "Scenario model",
      description: "Simulate yield, ROI and sustainability under recommended interventions.",
      kpis: [
        { label: "Current Yield", value: "38 qtl/ha" },
        { label: "Predicted Yield", value: "44 qtl/ha", tone: "success", delta: 15.8 },
        { label: "Yield Gain", value: "+6 qtl/ha", tone: "success" },
        { label: "Sustainability", value: "78/100", tone: "success" },
      ],
      insights: [
        "Correcting zinc + phosphorus drives 70% of the projected yield gain.",
        "ROI of 3.2x achieved within a single cropping cycle.",
        "Sustainability score rises as balanced nutrition restores organic carbon.",
      ],
    }} />
  ),
});
