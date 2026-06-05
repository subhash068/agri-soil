import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Pill } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { Kpi } from "@/components/ui-kit/Kpi";
import { MultiLine, Bars } from "@/components/charts/Charts";
import { weatherSeries } from "@/lib/mock-data";
import { CloudSun, Thermometer, Droplets, Wind } from "lucide-react";

export const Route = createFileRoute("/_app/weather")({
  head: () => ({ meta: [{ title: "Weather Intelligence — AgriSoil AI" }] }),
  component: Weather,
});

function Weather() {
  return (
    <div className="space-y-6">
      <PageHeader icon={<CloudSun className="h-5 w-5" />} title="Weather Intelligence"
        description="Rainfall, humidity, temperature & soil moisture driven advisories" actions={<Pill tone="info">IMD · Sentinel</Pill>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi index={0} label="Temperature" value="31°C" icon={Thermometer} tone="warning" />
        <Kpi index={1} label="Humidity" value="68%" icon={Droplets} tone="info" />
        <Kpi index={2} label="Soil Moisture" value="42%" icon={Wind} tone="success" />
        <Kpi index={3} label="Rainfall (MTD)" value="148 mm" icon={CloudSun} tone="info" delta={12} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Temperature & Humidity" subtitle="12-month">
          <MultiLine data={weatherSeries} keys={[{ key: "temp", color: "var(--color-chart-4)" }, { key: "humidity", color: "var(--color-chart-3)" }]} />
        </Panel>
        <Panel title="Rainfall & Soil Moisture" subtitle="12-month">
          <Bars data={weatherSeries} xKey="month" keys={[{ key: "rainfall", color: "var(--color-chart-3)" }, { key: "moisture", color: "var(--color-chart-1)" }]} />
        </Panel>
      </div>
    </div>
  );
}
