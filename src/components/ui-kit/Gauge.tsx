export function Gauge({
  value,
  max = 100,
  label,
  size = 160,
  unit = "",
  color = "var(--color-primary)",
}: {
  value: number;
  max?: number;
  label?: string;
  size?: number;
  unit?: string;
  color?: string;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  // 270deg arc
  const arc = 0.75;
  const dash = c * arc;
  const offset = dash * (1 - pct);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="-mt-[calc(50%+8px)] flex flex-col items-center" style={{ marginBottom: size * 0.18 }}>
        <span className="text-3xl font-bold tabular-nums text-foreground">
          {value}
          <span className="text-base font-medium text-muted-foreground">{unit}</span>
        </span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
