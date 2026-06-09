import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Kpi } from "@/components/ui-kit/Kpi";
import { Panel } from "@/components/ui-kit/Panel";
import { APMap } from "@/components/maps/APMap";
import { AreaTrend, Bars, MultiLine } from "@/components/charts/Charts";
import {
  STATE_KPIS,
  deficiencyTrend,
  fertilizerDemand,
  yieldForecast,
  districtRanking,
  SEVERITY_COLOR,
  HOTSPOTS,
} from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import {
  Users,
  MapPinned,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  IndianRupee,
  Droplets,
  LayoutDashboard,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Executive Dashboard — AgriSoil AI" }] }),
  component: Dashboard,
});

const fmt = (n: number) => n.toLocaleString("en-IN");

function Dashboard() {
  const district = useAppStore((s) => s.district);
  const ranking = districtRanking();

  const { data: kpiData } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: () => fetch("http://localhost:8000/dashboard/kpis").then(r => r.json()),
  });

  // Use backend data if available, fallback to mock data
  const parcelsCount = kpiData?.parcels_monitored || STATE_KPIS.parcels;
  const avgHealth = kpiData?.healthy_crop_percent || STATE_KPIS.soilHealth;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LayoutDashboard className="h-5 w-5" />}
        title="Executive Command Center"
        description={`State-wide soil intelligence overview · Focus: ${district} District`}
        actions={
          <>
            <Pill tone="success">● Live</Pill>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
              <Download className="h-4 w-4" /> Export
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi index={0} label="Total Farmers" value={fmt(STATE_KPIS.farmers)} icon={Users} delta={4.2} sub="enrolled" />
        <Kpi index={1} label="Total Parcels" value={fmt(parcelsCount)} icon={MapPinned} delta={2.8} sub="geo-tagged" />
        <Kpi index={2} label="Avg Soil Health" value={`${avgHealth}/100`} icon={HeartPulse} tone="success" delta={3.1} />
        <Kpi index={3} label="Deficiency Rate" value={`${STATE_KPIS.deficiencyRate}%`} icon={AlertTriangle} tone="warning" delta={-1.6} />
        <Kpi index={4} label="Advisory Adoption" value={`${STATE_KPIS.adoption}%`} icon={CheckCircle2} tone="info" delta={6.4} />
        <Kpi index={5} label="Est. Yield Gain" value={`+${STATE_KPIS.yieldGain}%`} icon={TrendingUp} tone="success" delta={1.9} />
        <Kpi index={6} label="Fertilizer Savings" value={`₹${STATE_KPIS.savings}Cr`} icon={IndianRupee} tone="success" delta={5.5} />
        <Kpi index={7} label="Groundwater Stress" value={`${STATE_KPIS.groundwaterStress}/100`} icon={Droplets} tone="destructive" delta={2.3} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="State Soil Health Map" subtitle="Choropleth by district · click to focus" className="lg:col-span-2">
          <APMap metricKey="soilHealth" height={400} />
        </Panel>

        <Panel title="District Heatmap" subtitle="Soil health ranking">
          <div className="space-y-3">
            {ranking.map((d) => (
              <div key={d.id} className="flex items-center gap-2.5">
                <span className="w-24 truncate text-xs font-medium">{d.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${d.soilHealth}%`,
                      background: d.soilHealth >= 70 ? "var(--color-success)" : d.soilHealth >= 55 ? "var(--color-warning)" : "var(--color-destructive)",
                    }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-semibold tabular-nums">{d.soilHealth}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Nutrient Deficiency Trends" subtitle="% parcels deficient · 12 months">
          <AreaTrend
            data={deficiencyTrend}
            keys={[
              { key: "Nitrogen", color: "var(--color-chart-1)" },
              { key: "Phosphorus", color: "var(--color-chart-2)" },
              { key: "Zinc", color: "var(--color-chart-4)" },
            ]}
          />
        </Panel>
        <Panel title="Fertilizer Demand Forecast" subtitle="'000 MT · projected">
          <Bars
            data={fertilizerDemand}
            xKey="month"
            stacked
            keys={[
              { key: "Urea", color: "var(--color-chart-1)" },
              { key: "DAP", color: "var(--color-chart-2)" },
              { key: "MOP", color: "var(--color-chart-3)" },
              { key: "Micronutrients", color: "var(--color-chart-4)" },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Yield Forecast" subtitle="qtl/ha · actual vs potential" className="lg:col-span-2">
          <MultiLine
            data={yieldForecast}
            xKey="year"
            keys={[
              { key: "actual", color: "var(--color-chart-1)" },
              { key: "potential", color: "var(--color-chart-2)" },
            ]}
          />
        </Panel>
        <Panel title="Critical Nutrient Alerts">
          <ul className="space-y-3">
            {HOTSPOTS.map((h) => (
              <li key={h.district + h.nutrient} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-semibold">{h.district}</p>
                  <p className="text-xs text-muted-foreground">{h.nutrient} deficiency</p>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: SEVERITY_COLOR[h.severity] }}>
                  {h.severity}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
