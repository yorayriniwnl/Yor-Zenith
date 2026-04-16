// app/(dashboard)/service5/page.tsx
// The Grid Guardian — routed within the dashboard layout (sidebar already provided by layout.tsx)

"use client";

import { useState, useEffect, useRef } from "react";
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

const FEED_EVENTS = [
  { text: "Last optimization: 1.2 sec ago", color: "#4ade80", dot: "bg-emerald-400" },
  { text: "Demand spike handled",           color: "#fbbf24", dot: "bg-yellow-400"  },
  { text: "Solar surplus detected",         color: "#38bdf8", dot: "bg-cyan-400"    },
  { text: "P2P trade executed: 2.4 kWh",   color: "#4ade80", dot: "bg-emerald-400" },
  { text: "Grid load reduced by 38%",       color: "#4ade80", dot: "bg-emerald-400" },
  { text: "Battery discharge optimal",      color: "#38bdf8", dot: "bg-cyan-400"    },
  { text: "Tariff window shift applied",    color: "#fbbf24", dot: "bg-yellow-400"  },
];

// ─── Live feed ────────────────────────────────────────────────────────────────
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
      // Defer state updates to async callbacks to satisfy strict React effect lint rules.
      const resetTimer = setTimeout(() => {
        setSecAgo(0.0);
        setEvents([]);
      }, 0);
      const schedule = [
        { delay: 300,  idx: 1 },
        { delay: 900,  idx: 2 },
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
      return () => {
        clearTimeout(resetTimer);
        timers.forEach(clearTimeout);
      };
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
    <div className="rounded-2xl border border-white/[0.07] bg-[#08090d] p-4 space-y-2 min-h-[140px]">
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
        <span className="text-[10px] font-mono text-emerald-400/70">{secAgo.toFixed(1)}s ago</span>
      </div>
      <div className="space-y-1.5">
        {events.length === 0 ? (
          <p className="text-xs text-white/20 font-mono italic">Awaiting events…</p>
        ) : (
          events.map((ev, i) => (
            <div key={ev.id} className="flex items-center gap-2 transition-all duration-500" style={{ opacity: Math.max(0.15, 1 - i * 0.15) }}>
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${ev.dot}`} />
              <span className="text-xs font-mono" style={{ color: ev.color }}>{ev.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Before vs After ─────────────────────────────────────────────────────────
function BeforeAfterCard() {
  const rows = [
    { label: "Monthly bill",    before: "₹5,200/month", after: "₹2,750/month" },
    { label: "Shared energy",   before: "0% shared",    after: "65% optimised" },
    { label: "Grid dependency", before: "100% grid",    after: "18% grid"      },
    { label: "P2P trades",      before: "None",         after: "Active daily"  },
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
      <div className="grid grid-cols-2 border-b border-white/10">
        <div className="px-5 py-3.5 flex items-center gap-2.5 border-r border-white/10">
          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-[10px] font-bold">✗</div>
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Without Lumen Logic</span>
        </div>
        <div className="px-5 py-3.5 flex items-center gap-2.5 bg-emerald-500/5">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold">✓</div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">With Lumen Logic</span>
        </div>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-2 border-b border-white/[0.06] last:border-0">
          <div className="px-5 py-3.5 border-r border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-1">{row.label}</p>
            <p className="text-sm font-mono text-gray-400 line-through decoration-red-500/60">{row.before}</p>
          </div>
          <div className="px-5 py-3.5 bg-emerald-500/[0.03]">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-1">{row.label}</p>
            <p className="text-sm font-mono font-bold text-emerald-300">{row.after}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tiny story ───────────────────────────────────────────────────────────────
function TinyStory() {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] px-5 py-4 flex gap-3 items-start">
      <span className="text-xl mt-0.5 shrink-0">⚡</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 mb-1.5">A day in the life</p>
        <p className="text-sm text-gray-400 leading-relaxed">
          At <span className="text-white font-medium">7:14 AM</span>, House A&apos;s solar panels hit peak output.
          Lumen Logic instantly routes <span className="text-emerald-400 font-medium">3.5 kWh</span> to House B and{" "}
          <span className="text-emerald-400 font-medium">2.1 kWh</span> to House C — before the grid even blinks.
          By noon, the microgrid has settled <span className="text-cyan-400 font-medium">₹2,450</span> in peer-to-peer trades, autonomously.
          No app opened. No decision made. <span className="text-white font-medium">Just intelligence, working.</span>
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
        relative group flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl font-bold text-sm
        transition-all duration-300 overflow-hidden
        ${isRunning
          ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-not-allowed"
          : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(52,211,105,0.3)] hover:shadow-[0_0_50px_rgba(52,211,105,0.45)] hover:scale-[1.02] active:scale-95"
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
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Run Optimization
        </>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GridGuardianPage() {
  const [result, setResult] = useState<LumenOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoTriggered, setDemoTriggered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
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
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Hero ── */}
      <section>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Smart Grid Control Center
        </div>

        {/* Title row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.05] tracking-tighter mb-3 bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent">
              The Grid Guardian
            </h1>
            <p className="text-[0.95rem] text-gray-400 max-w-xl leading-relaxed">
              AI-powered microgrid optimizer for real-time peer-to-peer energy trading,
              cost reduction, and smart grid load balancing.
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex gap-3 shrink-0 flex-wrap">
            <div className="rounded-xl bg-[#0a1a20] border border-cyan-500/20 px-4 py-3 text-center min-w-[96px]">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-mono mb-1">Energy Shared</p>
              <p className="text-lg font-extrabold text-cyan-300 font-mono">1,873 kWh</p>
              <p className="text-[9px] text-white/25 mt-0.5">Network stable</p>
            </div>
            <div className="rounded-xl bg-[#0a1a20] border border-emerald-500/20 px-4 py-3 text-center min-w-[96px]">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-mono mb-1">Monthly Saved</p>
              <p className="text-lg font-extrabold text-emerald-300 font-mono">₹3,500</p>
              <p className="text-[9px] text-white/25 mt-0.5">vs last month</p>
            </div>
            <div className="rounded-xl bg-[#0a1a20] border border-violet-500/20 px-4 py-3 text-center min-w-[96px]">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-mono mb-1">Efficiency</p>
              <p className="text-lg font-extrabold text-violet-300 font-mono">78%</p>
              <p className="text-[9px] text-white/25 mt-0.5">Optimized</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tiny story ── */}
      <TinyStory />

      {/* ── Run Optimization CTA card ── */}
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1">
            <h2 className="text-base font-bold text-white mb-1.5">Run Smart Optimization</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Balance demand in real time — routes solar surplus, handles demand spikes,
              and settles P2P trades instantly. Results appear right below.
            </p>
          </div>
          <div className="sm:w-52 shrink-0 flex flex-col gap-1.5">
            <RunOptimizationButton onRun={handleDemoRun} isRunning={demoRunning} />
            <p className="text-[10px] text-gray-600 text-center font-mono">
              Loads preset · animates flows
            </p>
          </div>
        </div>

        {/* Loading state — right below the button */}
        {(loading || demoRunning) && (
          <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.08] px-4 py-3 text-cyan-200 flex items-center gap-3 text-sm">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
            Running optimization… balancing solar output, battery, and grid draw.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
            {error}
          </div>
        )}
      </section>

      {/* ── Results block — slides in RIGHT AFTER button press ── */}
      {result && (
        <div
          ref={resultRef}
          className="space-y-5"
          style={{ animation: "fadeSlideIn 0.45s ease both" }}
        >
          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(-10px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Status badges */}
          <StatusAlerts {...result} />

          {/* Metric cards */}
          <MetricsRow data={result} />

          {/* Flow diagram + summary */}
          <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-5 items-start">
            <div className="rounded-2xl bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-white/10 p-5 shadow-[0_0_80px_rgba(52,211,105,0.05)]">
              <div className="mb-4">
                <div className="inline-block mb-2 px-3 py-1 text-[10px] font-semibold bg-white/5 border border-white/10 rounded-full text-gray-400 uppercase tracking-wider">
                  Live Energy Flow
                </div>
                <h2 className="text-base font-bold mb-1">Grid + Peer-to-Peer Optimization</h2>
                <p className="text-xs text-gray-500">Flows update after every optimization run</p>
              </div>
              <EnergyFlowDiagram data={result} />
            </div>
            <OptimizationSummary {...result} />
          </div>

          {/* Live feed */}
          <LiveFeed triggered={demoTriggered} />
        </div>
      )}

      {/* ── Before vs After ── */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-base font-bold text-white">Before vs After</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400">
            Must See
          </span>
        </div>
        <BeforeAfterCard />
      </section>

      {/* ── Custom scenario form ── */}
      <section>
        <ScenarioForm onSubmit={handleRun} />
      </section>

    </div>
  );
}