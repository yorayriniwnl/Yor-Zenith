  "use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRightLeft,
  Cpu,
  Gauge,
  IndianRupee,
  Zap,
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import type { LumenInput, LumenOutput } from "@/lib/lumen/types";
import BeforeAfterComparison from "@/components/lumen/BeforeAfterComparison";
import EnergyFlowDiagram from "@/components/lumen/EnergyFlowDiagram";
import HouseGraph from "@/components/lumen/HouseGraph";
import ScenarioForm from "@/components/lumen/ScenarioForm";
import StatusAlerts from "@/components/lumen/StatusAlerts";

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

const INR_MULTIPLIER = 660;

const FEED_EVENTS = [
  { text: "Routing update: peer-to-peer balance refreshed", tone: "emerald" as const },
  { text: "Solar surplus redirected away from the grid", tone: "cyan" as const },
  { text: "Tariff window changed, strategy re-ranked", tone: "amber" as const },
  { text: "Battery discharge profile optimized", tone: "emerald" as const },
  { text: "Neighborhood load spike absorbed", tone: "cyan" as const },
  { text: "Grid dependency remains below target", tone: "emerald" as const },
];

function formatInr(value: number) {
  return `Rs ${Math.round(value).toLocaleString("en-IN")}`;
}

function formatMetric(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
}

function PanelShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#14302c] bg-[#07110f] p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div className="mb-6 flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#849796]">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-[1.5rem] font-bold tracking-[-0.04em] text-white">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8ea5b4]">
            {description}
          </p>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function OverviewStatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.65rem] border border-cyan-400/30 bg-[#0a1220] p-5">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#20dfff] via-[#18c4f4] to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="max-w-[12rem] text-[0.95rem] leading-7 text-[#aab8c5]">
            {label}
          </p>
          <p className="mt-5 text-[clamp(2rem,3vw,3.15rem)] font-black tracking-[-0.06em] text-white">
            {value}
          </p>
          <p className="mt-2 text-sm text-cyan-200/70">{helper}</p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-cyan-500/10 text-cyan-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SnapshotMeter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "cyan" | "blue";
}) {
  const styles = {
    emerald: {
      fill: "from-[#15d6a6] to-[#1b9f6f]",
      glow: "shadow-[0_0_22px_rgba(21,214,166,0.18)]",
      text: "text-emerald-300",
    },
    cyan: {
      fill: "from-[#18cfff] to-[#0ea5e9]",
      glow: "shadow-[0_0_22px_rgba(24,207,255,0.18)]",
      text: "text-cyan-300",
    },
    blue: {
      fill: "from-[#6990ff] to-[#37bcff]",
      glow: "shadow-[0_0_22px_rgba(105,144,255,0.18)]",
      text: "text-blue-300",
    },
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[#9db3c1]">{label}</span>
        <span className={`text-sm font-semibold ${styles.text}`}>{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${styles.fill} ${styles.glow}`}
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function LiveFeed({ cycle }: { cycle: number }) {
  const [events, setEvents] = useState<
    { id: number; text: string; tone: "emerald" | "cyan" | "amber" }[]
  >([]);
  const [secondsAgo, setSecondsAgo] = useState(0.6);
  const idRef = useRef(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((current) => Number((current + 0.1).toFixed(1)));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (cycle === 0) return;

    const resetTimer = setTimeout(() => {
      setEvents([]);
      setSecondsAgo(0);
    }, 0);

    const timers = FEED_EVENTS.slice(0, 4).map((event, index) =>
      setTimeout(() => {
        setEvents((current) => [{ ...event, id: idRef.current++ }, ...current].slice(0, 6));
      }, 250 + index * 350)
    );

    return () => {
      clearTimeout(resetTimer);
      timers.forEach(clearTimeout);
    };
  }, [cycle]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextEvent = FEED_EVENTS[Math.floor(Math.random() * FEED_EVENTS.length)];
      setEvents((current) => [{ ...nextEvent, id: idRef.current++ }, ...current].slice(0, 6));
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const toneClass = {
    emerald: "bg-emerald-400 text-emerald-300",
    cyan: "bg-cyan-400 text-cyan-300",
    amber: "bg-amber-300 text-amber-200",
  };

  return (
    <section className="rounded-[2rem] border border-[#13322b] bg-[#07110f] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#849796]">
            Live System Feed
          </p>
          <h2 className="mt-2 text-[1.45rem] font-bold tracking-[-0.04em] text-white">
            Operational activity
          </h2>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
          Updated {secondsAgo.toFixed(1)}s ago
        </div>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-[#8ea5b4]">
            Awaiting engine events.
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={event.id}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#0b1715] px-4 py-3"
              style={{ opacity: Math.max(0.42, 1 - index * 0.12) }}
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneClass[event.tone].split(" ")[0]}`} />
              <p className={`text-sm ${toneClass[event.tone].split(" ")[1]}`}>{event.text}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default function GridGuardianPage() {
  const [result, setResult] = useState<LumenOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [feedCycle, setFeedCycle] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isBusy = loading || demoRunning;
  const displayData = result ?? DEMO_OUTPUT;
  const totalShared = displayData.A_to_B + displayData.A_to_C + displayData.B_to_C;
  const totalGrid = displayData.grid_to_A + displayData.grid_to_B + displayData.grid_to_C;
  const monthlySavings = displayData.savings * INR_MULTIPLIER;
  const savingsPercent =
    displayData.baseline_cost > 0
      ? ((displayData.baseline_cost - displayData.total_cost) / displayData.baseline_cost) * 100
      : 0;
  const autonomousRouting =
    totalShared + totalGrid > 0 ? (totalShared / (totalShared + totalGrid)) * 100 : 0;
  const gridRelief = Math.max(0, Math.min(100, displayData.efficiency_gain_percent + 18));

  async function handleDemoRun() {
    if (demoRunning) return;
    setDemoRunning(true);
    setFeedCycle((current) => current + 1);
    setError(null);
    setResult(null);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setResult(DEMO_OUTPUT);
    setDemoRunning(false);
  }

  async function handleRun(data: LumenInput) {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/lumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to run optimization");
      }
      setResult(json);
      setFeedCycle((current) => current + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ClientOnly fallback={<div className="min-h-screen bg-[#040908]" />}>
      <div className="min-h-screen overflow-x-hidden bg-[#040908] text-white selection:bg-cyan-400/20">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute left-[-8%] top-[-18%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/[0.09] blur-[160px]" />
          <div className="absolute bottom-[-24%] right-[-12%] h-[28rem] w-[28rem] rounded-full bg-cyan-500/[0.08] blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(21,214,166,0.05),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(24,207,255,0.06),transparent_25%)]" />
        </div>

        <main className="relative z-10 mx-auto w-full max-w-[92rem] space-y-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-12">
          <section className="border-b border-[#122723] pb-8 md:pb-12">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#1a3648] bg-[#101a27]/80 px-5 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
              <Cpu className="h-4 w-4 text-[#14d6a2]" />
              <span className="text-[0.88rem] font-semibold uppercase tracking-[0.12em] text-[#cfd5dd]">
                Zenith Enterprise OS v6.0
              </span>
            </div>

            <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-5xl">
                <h1 className="text-[clamp(2.5rem,5vw,5.2rem)] font-black leading-[0.98] tracking-[-0.07em] text-white">
                  Next-Gen{" "}
                  <span className="text-[#20dfff]">
                    Grid Intelligence
                  </span>
                </h1>
                <p className="mt-6 max-w-4xl text-[1.08rem] leading-8 text-[#c8d2dc]">
                  Autonomous Microgrid Control for Decentralized Neighborhood Energy Sharing
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={handleDemoRun}
                  disabled={isBusy}
                  className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                    isBusy
                      ? "cursor-not-allowed border border-cyan-400/[0.15] bg-cyan-400/10 text-cyan-200"
                      : "bg-gradient-to-r from-[#20dfff] to-[#0891b2] text-[#03120f] shadow-[0_16px_40px_rgba(32,223,255,0.18)] hover:brightness-110"
                  }`}
                >
                  {isBusy ? "Optimization running..." : "Run Optimization"}
                </button>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs sm:text-sm text-[#9fb0bb]">
                  Live control state updates
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <section className="relative rounded-2xl border border-[#15352f] bg-[#06100e] p-6 sm:p-8 lg:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-gradient-to-b from-[#20dfff] via-[#18c4f4] to-transparent" />
            <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between xl:gap-12">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cyan-400/[0.15] bg-cyan-500/[0.08] text-cyan-300">
                  <Zap className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[clamp(1.8rem,5vw,2.8rem)] font-black tracking-[-0.06em] text-white">
                    GridGuardian
                  </h2>
                  <p className="mt-3 text-lg text-[#9fb4ad]">Smart Grid Control Center</p>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-[#90a9bc]">
                    Control Center for a Connected Microgrid of Multiple Homes
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-3 rounded-xl border border-cyan-400/[0.25] bg-cyan-500/[0.1] px-5 py-3 text-sm text-cyan-200 shadow-[0_0_0_1px_rgba(32,223,255,0.08)_inset] whitespace-nowrap">
                <span className="h-3 w-3 rounded-full bg-[#20dfff] shadow-[0_0_16px_rgba(32,223,255,0.65)]" />\
                Optimization Engine: Active &amp; Learning
              </div>
            </div>

            <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <OverviewStatCard
                icon={<ArrowRightLeft className="h-5 w-5" />}
                label="Total Energy Shared (kWh)"
                value={`${formatMetric(totalShared)} kWh`}
                helper="Neighborhood exchange across homes"
              />
              <OverviewStatCard
                icon={<IndianRupee className="h-5 w-5" />}
                label="Monthly Savings (Rs)"
                value={formatInr(monthlySavings)}
                helper="Projected value from current routing"
              />
              <OverviewStatCard
                icon={<Gauge className="h-5 w-5" />}
                label="Optimization Efficiency (%)"
                value={`${displayData.efficiency_gain_percent.toFixed(0)}%`}
                helper="Dispatch gain from current model"
              />
              <OverviewStatCard
                icon={<Activity className="h-5 w-5" />}
                label="Autonomous Routing (%)"
                value={`${autonomousRouting.toFixed(0)}%`}
                helper="Share of demand handled peer-to-peer"
              />
            </div>
          </section>

          <section className="grid gap-6 lg:gap-8 xl:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.3fr)]">
            <div className="space-y-6">
              <PanelShell
                eyebrow="Configuration"
                title="Control Inputs"
                description="Calibrate generation, household demand, battery support, and tariff logic for the optimizer."
              >
                <ScenarioForm onSubmitAction={handleRun} />
              </PanelShell>

              <PanelShell
                eyebrow="Operational Alerts"
                title="System Status"
                description="Routing quality, grid dependency, and dispatch health from the latest optimizer output."
              >
                <div className="space-y-4">
                  <StatusAlerts {...displayData} />
                  <div className="rounded-xl border border-white/10 bg-[#0b1715] px-4 py-3 text-xs sm:text-sm text-[#8ea5b4] leading-6">
                    {result
                      ? "Latest optimization synced successfully. Inspect the graph and routing panel for live neighborhood movement."
                      : "Preview metrics are loaded. Run a custom scenario to replace them with your own dispatch output."}
                  </div>
                </div>
              </PanelShell>

              <LiveFeed cycle={feedCycle} />
            </div>

            <div className="space-y-6">
              <PanelShell
                eyebrow="Neighborhood Graph"
                title="Live Microgrid View"
                description="How power moves between homes, the utility connection, and the shared battery."
                actions={
                  <div className="rounded-full border border-cyan-400/[0.15] bg-cyan-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300 whitespace-nowrap">
                    {isBusy ? "Optimizing" : "Streaming View"}
                  </div>
                }
              >
                <HouseGraph data={displayData} isRunning={isBusy} />
              </PanelShell>

              <PanelShell
                eyebrow="Energy Intelligence"
                title="Peer-to-Peer Routing"
                description="Detailed line-level flows between each node in the neighborhood network."
              >
                <EnergyFlowDiagram data={displayData} />
              </PanelShell>
            </div>
          </section>

          <section className="grid gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <PanelShell
              eyebrow="Cost Delta"
              title="Before vs After"
              description="A side-by-side cost comparison showing how optimization reduces spend and redistributes flows."
            >
              <BeforeAfterComparison data={displayData} />
            </PanelShell>

            <PanelShell
              eyebrow="Engine Snapshot"
              title="Dispatch Summary"
              description="A compact view of how the optimizer is balancing shared energy, grid draw, and savings right now."
            >
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/6 bg-[#0b1715] p-4">
                    <p className="text-sm text-[#90a3af]">Baseline cost</p>
                    <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
                      {formatInr(displayData.baseline_cost * INR_MULTIPLIER)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-emerald-400/[0.12] bg-emerald-500/[0.05] p-4">
                    <p className="text-sm text-emerald-200/[0.75]">Optimized cost</p>
                    <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
                      {formatInr(displayData.total_cost * INR_MULTIPLIER)}
                    </p>
                  </div>
                </div>

                <SnapshotMeter label="Cost savings uplift" value={savingsPercent} tone="emerald" />
                <SnapshotMeter label="Grid relief performance" value={gridRelief} tone="cyan" />
                <SnapshotMeter label="Autonomous routing confidence" value={autonomousRouting} tone="blue" />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/6 bg-[#0b1715] px-4 py-3">
                    <p className="text-sm text-[#90a3af]">Grid draw</p>
                    <p className="mt-2 text-xl font-bold text-white">{formatMetric(totalGrid)} kWh</p>
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-[#0b1715] px-4 py-3">
                    <p className="text-sm text-[#90a3af]">Peer-to-peer trade</p>
                    <p className="mt-2 text-xl font-bold text-white">{formatMetric(totalShared)} kWh</p>
                  </div>
                </div>
              </div>
            </PanelShell>
          </section>
        </main>
      </div>
    </ClientOnly>
  );
}
