"use client";

import { useEffect, useState } from "react";
import type { LumenOutput } from "@/lib/lumen/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = { data: LumenOutput };

type BarDef = {
  label: string;
  baseline: number;
  optimized: number;
};

// ─── Derived per-home costs ───────────────────────────────────────────────────
// Baseline: evenly split (all homes pay grid_price × demand; we only have the total)
// Optimized: proportioned by each home's grid draw; P2P recipients are implicitly cheaper

function deriveHomeCosts(data: LumenOutput): BarDef[] {
  const baselinePer = data.baseline_cost / 3;
  const totalGrid = data.grid_to_A + data.grid_to_B + data.grid_to_C;

  const gridShares =
    totalGrid > 0
      ? [data.grid_to_A / totalGrid, data.grid_to_B / totalGrid, data.grid_to_C / totalGrid]
      : [1 / 3, 1 / 3, 1 / 3];

  return ["A", "B", "C"].map((label, i) => ({
    label: `Home ${label}`,
    baseline: parseFloat(baselinePer.toFixed(2)),
    optimized: parseFloat((gridShares[i] * data.total_cost).toFixed(2)),
  }));
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "emerald" | "cyan" | "violet";
}) {
  const ring = {
    emerald: "border-emerald-400/25 bg-emerald-400/8",
    cyan: "border-cyan-400/25 bg-cyan-400/8",
    violet: "border-violet-400/25 bg-violet-400/8",
  }[color];

  const text = {
    emerald: "text-emerald-300",
    cyan: "text-cyan-300",
    violet: "text-violet-300",
  }[color];

  const sub = {
    emerald: "text-emerald-500",
    cyan: "text-cyan-500",
    violet: "text-violet-500",
  }[color];

  return (
    <div
      className={`flex-1 flex items-center gap-3 rounded-2xl px-4 py-3.5 border ${ring}`}
      style={{ background: "rgba(255,255,255,0.025)" }}
    >
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${sub} bg-white/[0.04] border border-white/[0.06]`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-base font-mono font-bold leading-tight ${text}`}>{value}</p>
        <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold mt-0.5 leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── Animated bar ─────────────────────────────────────────────────────────────

function BarColumn({
  label,
  value,
  maxValue,
  mounted,
  variant,
  delay,
}: {
  label: string;
  value: number;
  maxValue: number;
  mounted: boolean;
  variant: "baseline" | "optimized";
  delay: number;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const minBarH = 8; // px — always show a sliver
  const targetH = Math.max(minBarH, pct);

  const isBase = variant === "baseline";

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      {/* Value label above bar */}
      <span
        className={`text-xs font-mono font-bold transition-opacity duration-300 ${
          mounted ? "opacity-100" : "opacity-0"
        } ${isBase ? "text-slate-400" : "text-emerald-300"}`}
        style={{ transitionDelay: `${delay + 250}ms` }}
      >
        ${value.toFixed(2)}
      </span>

      {/* Bar track */}
      <div className="relative w-full rounded-t-lg overflow-hidden flex items-end" style={{ height: 120 }}>
        {/* Track background */}
        <div className="absolute inset-0 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />

        {/* Animated fill */}
        <div
          className="w-full rounded-t-md transition-all ease-out relative overflow-hidden"
          style={{
            height: mounted ? `${targetH}%` : "0%",
            transitionDuration: "700ms",
            transitionDelay: `${delay}ms`,
                  background: isBase
                    ? "linear-gradient(180deg, rgba(22,28,39,0.96) 0%, rgba(14,18,26,0.92) 100%)"
                    : "linear-gradient(180deg, rgba(22,28,39,0.98) 0%, rgba(10,14,20,0.96) 100%)",
            boxShadow: isBase
              ? "none"
                    : "0 -6px 18px rgba(74,222,128,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Shimmer on optimized */}
          {!isBase && (
            <div
              className="absolute inset-x-0 top-0 h-4 opacity-40"
              style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)",
              }}
            />
          )}
        </div>
      </div>

      {/* Home label */}
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </span>
    </div>
  );
}

// ─── Half panel (baseline or optimized) ──────────────────────────────────────

function Panel({
  side,
  bars,
  mounted,
}: {
  side: "baseline" | "optimized";
  bars: BarDef[];
  mounted: boolean;
}) {
  const isOpt = side === "optimized";
  const maxVal = Math.max(...bars.map((b) => (isOpt ? b.optimized : b.baseline)), 0.01);

  return (
    <div
      className="flex-1 rounded-2xl p-5 flex flex-col gap-4"
      style={{
              background: isOpt
                ? "linear-gradient(135deg, rgba(10,14,20,0.92) 0%, rgba(22,163,74,0.03) 100%)"
                : "rgba(255,255,255,0.025)",
              border: isOpt
                ? "1px solid rgba(74,222,128,0.16)"
                : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Panel header */}
      <div className="flex items-center gap-2.5">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            isOpt ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/15 text-red-400"
          }`}
        >
          {isOpt ? "✓" : "✗"}
        </div>
        <p className={`text-[11px] font-bold uppercase tracking-[0.14em] ${isOpt ? "text-emerald-400" : "text-slate-400"}`}>
          {isOpt ? "With Lumen Logic AI" : "Without Lumen Logic"}
        </p>
      </div>

      {/* Bars */}
      <div className="flex gap-3 items-end">
        {bars.map((bar, i) => (
          <BarColumn
            key={bar.label}
            label={bar.label}
            value={isOpt ? bar.optimized : bar.baseline}
            maxValue={maxVal}
            mounted={mounted}
            variant={side}
            delay={i * 100}
          />
        ))}
      </div>

      {/* Total row */}
      <div
        className="rounded-xl px-3 py-2.5 flex items-center justify-between"
        style={{
                background: isOpt ? "rgba(10,14,20,0.9)" : "rgba(255,255,255,0.03)",
                border: isOpt ? "1px solid rgba(74,222,128,0.12)" : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Total
        </span>
        <span className={`text-sm font-mono font-bold ${isOpt ? "text-emerald-300" : "text-slate-300"}`}>
          ${(isOpt
            ? bars.reduce((s, b) => s + b.optimized, 0)
            : bars.reduce((s, b) => s + b.baseline, 0)
          ).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ─── Centre savings badge ─────────────────────────────────────────────────────

function SavingsBadge({ savings, pct }: { savings: number; pct: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 shrink-0 z-10">
      {/* Arrow connector top */}
      <div className="flex flex-col items-center gap-1 opacity-40">
        <div className="w-px h-6 bg-gradient-to-b from-transparent to-emerald-400" />
      </div>

      {/* Badge */}
      <div
        className="relative flex flex-col items-center gap-1 rounded-2xl px-5 py-4"
        style={{
          background: "linear-gradient(135deg, rgba(74,222,128,0.18) 0%, rgba(22,163,74,0.10) 100%)",
          border: "1px solid rgba(74,222,128,0.35)",
          boxShadow:
            "0 0 0 1px rgba(74,222,128,0.1), 0 0 32px rgba(74,222,128,0.2), 0 0 64px rgba(74,222,128,0.08)",
          animation: "lumen-pulse 2.8s ease-in-out infinite",
        }}
      >
        {/* Glow halo */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(74,222,128,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Up arrow */}
        <svg
          className="relative w-5 h-5 text-emerald-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>

        {/* Amount */}
        <p className="relative text-xl font-black font-mono text-emerald-300 leading-none whitespace-nowrap">
          ₹{(savings * 83).toFixed(0)}
        </p>

        {/* Label */}
        <p className="relative text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500 leading-none">
          SAVED
        </p>

        {/* Percent sub-label */}
        <p className="relative text-[10px] font-mono text-emerald-400/70 leading-none mt-0.5">
          −{pct.toFixed(1)}%
        </p>
      </div>

      {/* Arrow connector bottom */}
      <div className="flex flex-col items-center gap-1 opacity-40">
        <div className="w-px h-6 bg-gradient-to-t from-transparent to-emerald-400" />
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes lumen-pulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(74,222,128,0.1), 0 0 32px rgba(74,222,128,0.2), 0 0 64px rgba(74,222,128,0.08); }
          50%       { box-shadow: 0 0 0 1px rgba(74,222,128,0.25), 0 0 48px rgba(74,222,128,0.35), 0 0 96px rgba(74,222,128,0.14); }
        }
      `}</style>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BeforeAfterComparison({ data }: Props) {
  const [mounted, setMounted] = useState(false);

  // Re-trigger bar animation whenever new data arrives
  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, [data]);

  const bars = deriveHomeCosts(data);

  // Derived stat values
  const lpEfficiency = data.efficiency_gain_percent.toFixed(1);
  const dsScore = Math.min(99, Math.round(58 + data.efficiency_gain_percent * 0.56));

  return (
    <div
      className="w-full rounded-3xl overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, rgba(15,20,30,0.97) 0%, rgba(8,10,18,0.97) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 24px 80px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(74,222,128,0.05)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="px-6 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-6 rounded-full"
            style={{
              background: "linear-gradient(180deg, #4ade80 0%, #16a34a 100%)",
              boxShadow: "0 0 10px rgba(74,222,128,0.5)",
            }}
          />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-200">
              Cost Comparison
            </h3>
            <p className="text-[10px] tracking-wide text-slate-600 mt-0.5">
              Per-home · estimated from optimizer output
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
          style={{
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.2)",
            color: "#4ade80",
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Live
        </div>
      </div>

      {/* ── Main chart area ──────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 flex gap-3 items-stretch">
        <Panel side="baseline" bars={bars} mounted={mounted} />
        <SavingsBadge savings={data.savings} pct={data.efficiency_gain_percent} />
        <Panel side="optimized" bars={bars} mounted={mounted} />
      </div>

      {/* ── Stat pills ───────────────────────────────────────────────────────── */}
      <div
        className="px-5 pb-5 pt-2 flex flex-col sm:flex-row gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <StatPill
          color="cyan"
          label="LP Efficiency"
          value={`${lpEfficiency}%`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
        />
        <StatPill
          color="violet"
          label="Data Science Score"
          value={`${dsScore}/100`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          }
        />
        <StatPill
          color="emerald"
          label="Homes Optimized"
          value="3"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
