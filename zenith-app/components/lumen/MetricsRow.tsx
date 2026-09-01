import type { LumenOutput } from "@/lib/lumen/types";

type MetricsRowProps = {
  data: LumenOutput;
};

type MetricCardProps = {
  label: string;
  value: string;
  accent: string;
  glowColor: string;
};

function MetricCard({ label, value, accent, glowColor }: MetricCardProps) {
  return (
    <div
      className={`
        relative flex-1 rounded-xl px-6 py-5
        bg-[#0d0f14] border border-white/[0.07]
        overflow-hidden group
        transition-transform duration-300 hover:-translate-y-0.5
      `}
      style={{ boxShadow: `0 0 0 1px ${glowColor}18, 0 4px 24px ${glowColor}14` }}
    >
      {/* Subtle top-edge glow line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${glowColor}55, transparent)` }}
      />

      {/* Background shimmer on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${glowColor}0d 0%, transparent 70%)` }}
      />

      <p className="relative text-[11px] font-semibold tracking-[0.18em] uppercase text-white/35 mb-3 font-mono">
        {label}
      </p>

      <p
        className="relative text-3xl font-light tracking-tight leading-none"
        style={{
          fontFamily: "'DM Mono', 'Fira Mono', 'Courier New', monospace",
          color: accent,
          textShadow: `0 0 24px ${glowColor}66`,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export default function MetricsRow({ data }: MetricsRowProps) {
  const metrics: MetricCardProps[] = [
    {
      label: "Optimized Cost",
      value: `$${data.total_cost.toFixed(2)}`,
      accent: "#e2e8f0",
      glowColor: "#94a3b8",
    },
    {
      label: "Savings",
      value: `$${data.savings.toFixed(2)}`,
      accent: "#4ade80",
      glowColor: "#22c55e",
    },
    {
      label: "Efficiency Gain",
      value: `${data.efficiency_gain_percent.toFixed(1)}%`,
      accent: "#38bdf8",
      glowColor: "#0ea5e9",
    },
  ];

  return (
    <div className="flex gap-3 w-full">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
