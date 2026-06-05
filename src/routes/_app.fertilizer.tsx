import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { FERT_RECS } from "@/lib/mock-data";
import { Beaker, Clock, IndianRupee, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/fertilizer")({
  head: () => ({ meta: [{ title: "Fertilizer Recommendation Engine — AgriSoil AI" }] }),
  component: Fertilizer,
});

function Fertilizer() {
  const totalCost = FERT_RECS.reduce((a, f) => a + f.cost, 0);
  const totalGain = FERT_RECS.reduce((a, f) => a + f.yieldGain, 0);
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Beaker className="h-5 w-5" />}
        title="Fertilizer Recommendation Engine"
        description="Crop · season · growth stage · soil health · deficiencies · groundwater · weather aware"
        actions={<Pill tone="success">Cotton · Kharif · Tadikonda</Pill>}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel bodyClassName="p-4"><p className="text-xs text-muted-foreground">Recommended Inputs</p><p className="mt-1 text-2xl font-bold">{FERT_RECS.length}</p></Panel>
        <Panel bodyClassName="p-4"><p className="text-xs text-muted-foreground">Total Cost</p><p className="mt-1 text-2xl font-bold">₹{totalCost.toLocaleString("en-IN")}/ha</p></Panel>
        <Panel bodyClassName="p-4"><p className="text-xs text-muted-foreground">Expected Yield Gain</p><p className="mt-1 text-2xl font-bold text-success">+{totalGain.toFixed(1)}%</p></Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {FERT_RECS.map((f) => (
          <Panel key={f.name} title={f.name} bodyClassName="space-y-3 p-5">
            <p className="text-sm text-muted-foreground">{f.reason}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-muted/60 p-2.5"><p className="text-[11px] text-muted-foreground">Dosage</p><p className="font-semibold">{f.dosage}</p></div>
              <div className="rounded-md bg-muted/60 p-2.5"><p className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="h-3 w-3" />Timing</p><p className="font-semibold">{f.timing}</p></div>
              <div className="rounded-md bg-muted/60 p-2.5"><p className="flex items-center gap-1 text-[11px] text-muted-foreground"><IndianRupee className="h-3 w-3" />Cost</p><p className="font-semibold">₹{f.cost}/ha</p></div>
              <div className="rounded-md bg-success/10 p-2.5"><p className="flex items-center gap-1 text-[11px] text-muted-foreground"><TrendingUp className="h-3 w-3" />Yield Gain</p><p className="font-semibold text-success">+{f.yieldGain}%</p></div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
