import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { Coins } from "lucide-react";
export const Route = createFileRoute("/_app/fertilizer-economics")({
  head: () => ({ meta: [{ title: "Fertilizer Economics — AgriSoil AI" }] }),
  component: () => (
    <ModulePage spec={{
      title: "Fertilizer Economics Engine", icon: Coins, tag: "Cost-benefit",
      description: "Current vs optimised fertilizer cost, savings and return on investment.",
      kpis: [
        { label: "Current Cost", value: "₹9,840/ha" },
        { label: "Optimised Cost", value: "₹7,060/ha", tone: "success" },
        { label: "Savings", value: "₹2,780/ha", tone: "success", delta: 28 },
        { label: "ROI", value: "3.2x", tone: "success" },
      ],
      insights: [
        "Balanced NPK + micronutrients cuts blanket urea overuse by 22%.",
        "Optimised plan saves ₹2,780/ha while raising yield 9.4%.",
        "State-scale rollout projects ₹152 Cr annual input savings.",
      ],
      chart: "bars",
    }} />
  ),
});
