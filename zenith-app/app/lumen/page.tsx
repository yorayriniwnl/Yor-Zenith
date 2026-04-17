"use client";

import { useState, useEffect, useRef } from "react";
import ClientOnly from "@/components/ClientOnly";
import type { LumenInput, LumenOutput } from "@/lib/lumen/types";
import MetricsRow from "@/components/lumen/MetricsRow";
import EnergyFlowDiagram from "@/components/lumen/EnergyFlowDiagram";
import OptimizationSummary from "@/components/lumen/OptimizationSummary";
import ScenarioForm from "@/components/lumen/ScenarioForm";
import StatusAlerts from "@/components/lumen/StatusAlerts";

// ─── Demo preset ──────────────────────────────────────────────────────────────
const DEMO_OUTPUT: LumenOutput = {
  A_to_B: 3.5,
  A_to_C: 2.1,
  B_to_C: 1.2,
  grid_to_A: 0.0,
  grid_to_B: 0.8,
  grid_to_C: 0.0,
  total_cost: 2.24,
  baseline_cost: 7.56,
  savings: 5.32,
  efficiency_gain_percent: 70.4,
};

// ─── Live feed messages ───────────────────────────────────────────────────────
const FEED_EVENTS = [
  { text: "Last optimization: 1.2 sec ago", color: "#4ade80", dot: "bg-emerald-400" },
  { text: "Demand spike handled", color: "#fbbf24", dot: "bg-yellow-400" },
  { text: "Solar surplus detected", color: "#38bdf8", dot: "bg-cyan-400" },
  { text: "P2P trade executed: 2.4 kWh", color: "#4ade80", dot: "bg-emerald-400" },
  { text: "Grid load reduced by 38%", color: "#4ade80", dot: "bg-emerald-400" },
  { text: "Battery discharge optimal", color: "#38bdf8", dot: "bg-cyan-400" },
  { text: "Tariff window shift applied", color: "#fbbf24", dot: "bg-yellow-400" },
];

// ─── Real-time live ticker ────────────────────────────────────────────────────
function LiveFeed({ triggered }: { triggered: boolean }) {
  const [events, setEvents] = useState<{ text: string; color: string; dot: string; id: number }[]>([]);
  const [secAgo, setSecAgo] = useState(1.2);
  const idRef = useRef(100);

  useEffect(() => {
    const t = setInterval(() => setSecAgo((s) => parseFloat((s + 0.1).toFixed(1))), 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (triggered) {
      setSecAgo(0.0);
      setEvents([]);
      const schedule = [
        { delay: 300, idx: 1 },
        { delay: 900, idx: 2 },
        { delay: 1500, idx: 3 },
        { delay: 2100, idx: 4 },
        { delay: 2700, idx: 5 },
      ];
      const timers = schedule.map(({ delay, idx }) =>
        setTimeout(() => {
          const ev = FEED_EVENTS[idx];
          setEvents((prev) => [{ ...ev, id: idRef.current++ }, ...prev].slice(0, 6));
        }, delay)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [triggered]);

  useEffect(() => {
    const t = setInterval(() => {
      const ev = FEED_EVENTS[Math.floor(Math.random() * FEED_EVENTS.length)];
      setEvents((prev) => [{ ...ev, id: idRef.current++ }, ...prev].slice(0, 6));
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#08090d] p-4 space-y-2 min-h-[148px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 font-mono">
            Live System Feed
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400/70">
          {secAgo.toFixed(1)}s ago
        </span>
      </div>
      <div className="space-y-1.5">
        {events.length === 0 ? (
          <p className="text-xs text-white/20 font-mono italic">Awaiting events…</p>
        ) : (
          events.map((ev, i) => (
            <div
              key={ev.id}
              className="flex items-center gap-2 transition-all duration-500"
              style={{ opacity: Math.max(0.15, 1 - i * 0.15) }}
            >
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${ev.dot}`} />
              <span className="text-xs font-mono" style={{ color: ev.color }}>
                {ev.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Before vs After card ─────────────────────────────────────────────────────
function BeforeAfterCard() {
  const rows = [
    { label: "Monthly bill", before: "₹5,200/month", after: "₹2,750/month" },
    { label: "Shared energy", before: "0% shared", after: "65% optimised" },
    { label: "Grid dependency", before: "100% grid", after: "18% grid" },
    { label: "P2P trades", before: "None", after: "Active daily" },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
      <div className="grid grid-cols-2 border-b border-white/10">
        <div className="px-6 py-4 flex items-center gap-3 border-r border-white/10">
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">✗</div>
          <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Without Lumen Logic</span>
        </div>
        <div className="px-6 py-4 flex items-center gap-3 bg-emerald-500/5">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">✓</div>
          <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">With Lumen Logic</span>
        </div>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-2 border-b border-white/[0.06] last:border-0">
          <div className="px-6 py-4 border-r border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-1">{row.label}</p>
            <p className="text-base font-mono text-gray-400 line-through decoration-red-500/60">{row.before}</p>
          </div>
          <div className="px-6 py-4 bg-emerald-500/[0.03]">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-1">{row.label}</p>
            <p className="text-base font-mono font-bold text-emerald-300">{row.after}</p>
          </div>
        </div>
      ))}
      <div className="px-6 py-4 bg-emerald-500/[0.06] border-t border-emerald-500/20 flex items-center gap-2">
        <span className="text-base">👉</span>
        <p className="text-sm text-gray-300">
          This is what converts your project from{" "}
          <span className="font-bold text-white">cool</span>
          <span className="text-gray-400 mx-1.5">→</span>
          <span className="font-bold text-emerald-400">impactful</span>
        </p>
      </div>
    </div>
  );
}

// ─── Tiny story ───────────────────────────────────────────────────────────────
function TinyStory() {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] px-6 py-5 flex gap-4 items-start">
      <span className="text-2xl mt-0.5 shrink-0">⚡</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-2">
          A day in the life
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          At <span className="text-white font-medium">7:14 AM</span>, House A's solar panels hit peak output.
          Lumen Logic instantly routes <span className="text-emerald-400 font-medium">3.5 kWh</span> to House B and{" "}
          <span className="text-emerald-400 font-medium">2.1 kWh</span> to House C — before the grid even blinks.
          By noon, the microgrid has settled{" "}
          <span className="text-cyan-400 font-medium">₹2,450</span> in peer-to-peer trades, autonomously.
          No app opened. No decision made.{" "}
          <span className="text-white font-medium">Just intelligence, working.</span>
        </p>
      </div>
    </div>
  );
}

// ─── Run Optimization button ──────────────────────────────────────────────────
function RunOptimizationButton({ onRun, isRunning }: { onRun: () => void; isRunning: boolean }) {
  return (
    <button
      onClick={onRun}
      disabled={isRunning}
      className={`
        relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base
        transition-all duration-300 overflow-hidden
        ${isRunning
          ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-not-allowed"
          : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_40px_rgba(52,211,105,0.35)] hover:shadow-[0_0_60px_rgba(52,211,105,0.5)] hover:scale-105 active:scale-95"
        }
      `}
    >
      {!isRunning && (
        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}
      {isRunning ? (
        <>
          <span className="relative flex h-4 w-4 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
          </span>
          Optimizing…
        </>
      ) : (
        <>
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Run Optimization
        </>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LumenPage() {
  const [result, setResult] = useState<LumenOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoTriggered, setDemoTriggered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDemoRun() {
    if (demoRunning) return;
    setDemoRunning(true);
    setDemoTriggered(true);
    setError(null);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1800));
    setResult(DEMO_OUTPUT);
    setDemoRunning(false);
    setTimeout(() => setDemoTriggered(false), 200);
  }

  async function handleRun(data: LumenInput) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/lumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to run optimization");
      setResult(json);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ClientOnly fallback={<div className="min-h-screen bg-[#06090f]" />}>
      <div className="min-h-screen bg-[#06090f] text-gray-50 selection:bg-emerald-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
      </div>

      <main className="relative z-10 w-full px-6 py-10 lg:px-16 lg:py-14 space-y-10">

        {/* Hero header + Run Optimization button */}
        <section className="max-w-[84rem] mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            New Zenith Service
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.02] mb-4 tracking-tighter">
                Lumen Logic
              </h1>
              <p className="text-[1.05rem] text-gray-400 max-w-2xl leading-relaxed font-light">
                AI-powered microgrid optimizer dashboard for real-time energy trading,
                cost reduction, and grid awareness.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <RunOptimizationButton onRun={handleDemoRun} isRunning={demoRunning} />
              <p className="text-[10px] text-gray-600 text-center font-mono tracking-wide">
                Loads preset scenario · animates flows · updates numbers
              </p>
            </div>
          </div>
        </section>

        {/* Tiny story */}
        <section className="max-w-[84rem] mx-auto">
          <TinyStory />
        </section>

        {/* Error / loading banners */}
        {error && (
          <div className="max-w-[84rem] mx-auto rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </div>
        )}
        {(loading || demoRunning) && (
          <div className="max-w-[84rem] mx-auto rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-cyan-200 flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
            Running optimization… balancing solar output, battery, and grid draw.
          </div>
        )}

        {/* Metrics + alerts */}
        {result && (
          <div className="max-w-[84rem] mx-auto space-y-4">
            <MetricsRow data={result} />
            <StatusAlerts {...result} />
          </div>
        )}

        {/* Before vs After */}
        <section className="max-w-[84rem] mx-auto">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Before vs After</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400">
              Must See
            </span>
          </div>
          <BeforeAfterCard />
        </section>

        {/* Main grid: flow diagram + live feed | summary */}
        <section className="max-w-[84rem] mx-auto grid xl:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
          <div className="space-y-6">
            <div className="rounded-[3rem] bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-white/10 p-4 md:p-7 shadow-[0_0_100px_rgba(52,211,105,0.05)]">
              <div className="text-center mb-8 pt-4">
                <div className="inline-block mb-4 px-4 py-1 text-xs font-semibold bg-white/5 border border-white/10 rounded-full text-gray-400">
                  Live Energy Flow
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Grid + Peer-to-Peer optimization view
                </h2>
                <p className="text-gray-400">Flows update after every optimization run.</p>
              </div>
              {result ? (
                <EnergyFlowDiagram data={result} />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-gray-400">
                  Hit{" "}
                  <span className="text-emerald-400 font-semibold">Run Optimization</span>{" "}
                  above or fill the form below to visualize energy flows.
                </div>
              )}
            </div>

            {/* Real-time live feed */}
            <LiveFeed triggered={demoTriggered} />
          </div>

          <div className="space-y-6">
            {result ? (
              <OptimizationSummary {...result} />
            ) : (
              <div className="rounded-2xl p-5 space-y-4 w-full max-w-md mx-auto xl:mx-0 bg-white/[0.03] border border-white/10">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
                  Optimization Summary
                </h2>
                <p className="text-sm text-slate-400">
                  Baseline vs optimized cost, grid usage, and P2P trade summary will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Custom scenario form */}
        <section className="max-w-[84rem] mx-auto">
          <ScenarioForm onSubmitAction={handleRun} />
        </section>

      </main>
      </div>
    </ClientOnly>
  );
}
