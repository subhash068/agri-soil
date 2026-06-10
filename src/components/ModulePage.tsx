import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Kpi } from "@/components/ui-kit/Kpi";
import { Panel } from "@/components/ui-kit/Panel";
import React, { Suspense } from "react";
import { AreaTrend, Bars } from "@/components/charts/Charts";
import { deficiencyTrend, fertilizerDemand } from "@/lib/mock-data";
import { Activity, BarChart3, Sparkles, type LucideIcon } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";

export interface ModuleSpec {
  title: string;
  description: string;
  icon: LucideIcon;
  tag?: string;
  kpis: { label: string; value: string; tone?: "default" | "success" | "warning" | "destructive" | "info"; delta?: number }[];
  insights: string[];
  showMap?: boolean;
  mapMetric?: "soilHealth" | "deficiencyRate" | "adoption" | "groundwaterStress" | "yieldGain";
  mapComponent?: React.ReactNode;
  chart?: "area" | "bars";
}

export function ModulePage({ spec }: { spec: ModuleSpec }) {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<spec.icon className="h-5 w-5" />}
        title={spec.title}
        description={spec.description}
        actions={spec.tag ? <Pill tone="info">{spec.tag}</Pill> : undefined}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {spec.kpis.map((k, i) => (
          <Kpi key={k.label} index={i} label={k.label} value={k.value} tone={k.tone} delta={k.delta} icon={Activity} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Intelligence Overview" subtitle="Trend analytics" className="lg:col-span-2">
          {spec.chart === "bars" ? (
            <Bars
              data={fertilizerDemand}
              xKey="month"
              keys={[
                { key: "Urea", color: "var(--color-chart-1)" },
                { key: "DAP", color: "var(--color-chart-2)" },
                { key: "Micronutrients", color: "var(--color-chart-4)" },
              ]}
            />
          ) : (
            <AreaTrend
              data={deficiencyTrend}
              keys={[
                { key: "Nitrogen", color: "var(--color-chart-1)" },
                { key: "Phosphorus", color: "var(--color-chart-2)" },
                { key: "Zinc", color: "var(--color-chart-4)" },
              ]}
            />
          )}
        </Panel>

        <Panel title="AI Insights" subtitle="Explainable findings">
          <ul className="space-y-3">
            {spec.insights.map((t) => (
              <li key={t} className="flex gap-2.5 rounded-md border border-border p-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{t}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {spec.showMap && spec.mapComponent && (
        <Panel title="Geospatial Layer" subtitle="District-level distribution" action={<BarChart3 className="h-4 w-4 text-muted-foreground" />}>
          <ClientOnly fallback={<div style={{ height: 380, background: "#0a0a0a" }} className="w-full rounded-lg" />}>
            {spec.mapComponent}
          </ClientOnly>
        </Panel>
      )}
    </div>
  );
}
