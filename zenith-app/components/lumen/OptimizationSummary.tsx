import type { LumenOutput } from "@/lib/lumen/types";
import type { ReactNode } from "react";

type OptimizationSummaryProps = LumenOutput;

function CostBar({
  baseline,
  optimized,
}: {
  baseline: number;
  optimized: number;
}) {
  const max = Math.max(baseline, optimized, 0.01);
  const baselineWidth = (baseline / max) * 100;
  const optimizedWidth = (optimized / max) * 100;
  const savingsPct =
    baseline > 0 ? ((baseline - optimized) / baseline) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Cost Comparison
        </span>
        {savingsPct > 0 && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-0.5">
            −{savingsPct.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Baseline bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            Baseline
          </span>
          <span className="text-sm font-mono text-slate-300">
            ${baseline.toFixed(2)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-slate-500/60 transition-all duration-700 ease-out"
            style={{ width: `${baselineWidth}%` }}
          />
        </div>
      </div>

      {/* Optimized bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            Optimized
          </span>
          <span className="text-sm font-mono text-emerald-300">
            ${optimized.toFixed(2)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${optimizedWidth}%`,
              background:
                "linear-gradient(90deg, #34d399 0%, #059669 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  unit,
  icon,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  icon: ReactNode;
  accent: "sky" | "violet";
}) {
  const accentStyles = {
    sky: {
      bg: "bg-sky-400/10",
      border: "border-sky-400/20",
      icon: "text-sky-400",
      value: "text-sky-300",
    },
    violet: {
      bg: "bg-violet-400/10",
      border: "border-violet-400/20",
      icon: "text-violet-400",
      value: "text-violet-300",
    },
  };
  const s = accentStyles[accent];

  return (
    <div
      className={`flex-1 rounded-xl p-4 ${s.bg} border ${s.border} flex flex-col gap-2`}
    >
      <div className={`w-7 h-7 ${s.icon}`}>{icon}</div>
      <div>
        <p className={`text-xl font-mono font-bold tracking-tight ${s.value}`}>
          {value.toFixed(2)}
          <span className="text-xs font-sans font-normal text-slate-500 ml-1">
            {unit}
          </span>
        </p>
        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-medium mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-full h-full">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const P2PIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-full h-full">
    <circle cx="7" cy="8" r="2.5" />
    <circle cx="17" cy="16" r="2.5" />
    <path d="M9.5 8h5a3 3 0 0 1 3 3v2" strokeLinecap="round" />
    <path d="M14.5 16h-5a3 3 0 0 1-3-3v-2" strokeLinecap="round" />
  </svg>
);

export default function OptimizationSummary(props: OptimizationSummaryProps) {
  const {
    baseline_cost,
    total_cost,
    savings,
    efficiency_gain_percent,
    grid_to_A,
    grid_to_B,
    grid_to_C,
    A_to_B,
    A_to_C,
    B_to_C,
  } = props;

  const totalGrid = grid_to_A + grid_to_B + grid_to_C;
  const totalP2P = A_to_B + A_to_C + B_to_C;

  return (
    <div
      className="rounded-2xl p-5 space-y-5 w-full max-w-md"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            Optimization Summary
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5 tracking-wide">
            Energy flow analysis
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-white leading-none">
            ${savings.toFixed(2)}
          </p>
          <p className="text-[11px] uppercase tracking-widest text-slate-500 mt-1">
            Saved
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

      {/* Cost comparison bars */}
      <CostBar baseline={baseline_cost} optimized={total_cost} />

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

      {/* Stat tiles */}
      <div className="flex gap-3">
        <StatTile
          label="Total Grid Used"
          value={totalGrid}
          unit="kWh"
          icon={<GridIcon />}
          accent="sky"
        />
        <StatTile
          label="Total P2P Traded"
          value={totalP2P}
          unit="kWh"
          icon={<P2PIcon />}
          accent="violet"
        />
      </div>

      {/* Footer efficiency pill */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(efficiency_gain_percent, 100)}%`,
              background: "linear-gradient(90deg, #818cf8 0%, #34d399 100%)",
              transition: "width 0.8s ease-out",
            }}
          />
        </div>
        <span className="text-xs font-mono text-slate-400 shrink-0">
          {efficiency_gain_percent.toFixed(1)}% efficiency gain
        </span>
      </div>
    </div>
  );
}
