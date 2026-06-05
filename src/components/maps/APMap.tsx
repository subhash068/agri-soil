import { DISTRICTS } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Schematic choropleth of Andhra Pradesh coastal districts.
// metricKey selects which district field drives the color ramp.
export function APMap({
  metricKey = "soilHealth",
  invert = false,
  height = 420,
  unit = "",
}: {
  metricKey?: "soilHealth" | "deficiencyRate" | "adoption" | "groundwaterStress" | "yieldGain";
  invert?: boolean;
  height?: number;
  unit?: string;
}) {
  const selected = useAppStore((s) => s.district);
  const setDistrict = useAppStore((s) => s.setDistrict);

  const values = DISTRICTS.map((d) => d[metricKey] as number);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const colorFor = (v: number) => {
    let t = (v - min) / (max - min || 1);
    if (invert) t = 1 - t;
    // green ramp: low -> amber/red, high -> green
    if (t > 0.66) return "var(--color-success)";
    if (t > 0.33) return "var(--color-warning)";
    return "var(--color-destructive)";
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border grid-bg" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        {/* stylised state blob */}
        <path
          d="M14 30 Q30 16 48 22 Q66 14 78 28 Q90 40 80 56 Q72 78 52 84 Q34 92 24 74 Q10 58 14 30 Z"
          fill="var(--color-primary)"
          opacity="0.07"
          stroke="var(--color-primary)"
          strokeOpacity="0.25"
          strokeWidth="0.5"
        />
        {DISTRICTS.map((d) => {
          const v = d[metricKey] as number;
          const isSel = d.name === selected;
          return (
            <g
              key={d.id}
              transform={`translate(${d.x * 100} ${d.y * 100})`}
              className="cursor-pointer"
              onClick={() => setDistrict(d.name)}
            >
              <circle
                r={isSel ? 6.4 : 5.2}
                fill={colorFor(v)}
                stroke="white"
                strokeWidth={isSel ? 1.1 : 0.6}
                opacity={isSel ? 1 : 0.9}
                style={{ transition: "all .25s ease" }}
              />
              <text
                y="-7.2"
                textAnchor="middle"
                className={cn("fill-foreground font-semibold", isSel ? "opacity-100" : "opacity-70")}
                style={{ fontSize: 2.9 }}
              >
                {d.name}
              </text>
              <text y="1" textAnchor="middle" className="fill-white font-bold" style={{ fontSize: 3 }}>
                {v}
                {unit}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-md bg-card/80 px-2.5 py-1.5 text-[10px] backdrop-blur">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-destructive" /> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Mid
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-success" /> High
        </span>
      </div>
    </div>
  );
}
