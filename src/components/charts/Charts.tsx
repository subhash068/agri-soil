import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AXIS = { fill: "#9ca3af", fontSize: 11 };
const GRID = "var(--color-border)";

const tooltipStyle = {
  contentStyle: {
    background: "hsl(155 30% 8%)",
    border: "1px solid hsl(155 15% 20%)",
    borderRadius: 8,
    fontSize: 12,
    color: "#e8f5e9",
  },
  labelStyle: { color: "#ffffff", fontWeight: 600 },
  itemStyle: { color: "#e8f5e9" },
};

export function AreaTrend({
  data,
  keys,
  height = 260,
  yUnit,
}: {
  data: Record<string, unknown>[];
  keys: { key: string; color: string }[];
  height?: number;
  yUnit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {keys.map((k) => (
            <linearGradient key={k.key} id={`g-${k.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={k.color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={k.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} formatter={yUnit ? (value: any) => `${value} ${yUnit}` : undefined} />
        {keys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {keys.map((k) => (
          <Area
            key={k.key}
            type="monotone"
            dataKey={k.key}
            stroke={k.color}
            fill={`url(#g-${k.key})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLine({
  data,
  xKey = "month",
  keys,
  height = 260,
}: {
  data: Record<string, unknown>[];
  xKey?: string;
  keys: { key: string; color: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {keys.map((k) => (
          <Line key={k.key} type="monotone" dataKey={k.key} stroke={k.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Bars({
  data,
  xKey,
  keys,
  height = 260,
  stacked = false,
  horizontal = false,
  yUnit,
  xAxisLabel,
  yAxisLabel,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  keys: { key: string; color: string }[];
  height?: number;
  stacked?: boolean;
  horizontal?: boolean;
  yUnit?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ 
          top: 8, 
          right: 8, 
          left: horizontal ? 8 : (yAxisLabel ? 0 : -16), 
          bottom: xAxisLabel ? 16 : 0 
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10, fill: "#9ca3af", fontSize: 11 } : undefined} />
            <YAxis type="category" dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} width={92} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 } : undefined} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} interval={0} label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -12, fill: "#9ca3af", fontSize: 11 } : undefined} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", offset: 10, fill: "#9ca3af", fontSize: 11 } : undefined} />
          </>
        )}
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} formatter={yUnit ? (value: any) => `${value} ${yUnit}` : undefined} />
        {keys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {keys.map((k) => (
          <Bar
            key={k.key}
            dataKey={k.key}
            fill={k.color}
            stackId={stacked ? "s" : undefined}
            radius={stacked ? 0 : [4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RadarStat({
  data,
  height = 280,
}: {
  data: { name: string; score: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="score" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} />
        <Tooltip {...tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function Donut({
  data,
  height = 240,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
