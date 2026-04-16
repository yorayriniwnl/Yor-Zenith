"use client";

import type { LumenOutput } from "@/lib/lumen/types";

// ─── layout ──────────────────────────────────────────────────────────────────

const VW = 700;
const VH = 460;
const NW = 150;
const NH = 52;

const ND = {
  grid: { cx: 350, cy: 55  },
  A:    { cx: 350, cy: 225 },
  B:    { cx: 100, cy: 400 },
  C:    { cx: 600, cy: 400 },
};

const MARKERS = [
  { id: "arr-blue",   color: "#38bdf8" },
  { id: "arr-violet", color: "#a78bfa" },
  { id: "arr-green",  color: "#4ade80" },
];

interface FlowDef {
  key: keyof LumenOutput;
  d: string;
  labelXY: [number, number];
  color: string;
  markerId: string;
}

// Quadratic bezier label positions are pre-computed via
// midpoint formula: 0.25·P0 + 0.5·P1 + 0.25·P2
const FLOWS: FlowDef[] = [
  // ── grid supply (blue) ────────────────────────────────────────────────────
  {
    key: "grid_to_A",
    d: "M 350 81 L 350 199",
    labelXY: [366, 140],
    color: "#38bdf8",
    markerId: "arr-blue",
  },
  {
    key: "grid_to_B",
    d: "M 275 55 Q 120 200 90 374",
    labelXY: [151, 207],
    color: "#38bdf8",
    markerId: "arr-blue",
  },
  {
    key: "grid_to_C",
    d: "M 425 55 Q 580 200 610 374",
    labelXY: [549, 207],
    color: "#38bdf8",
    markerId: "arr-blue",
  },
  // ── peer-to-peer (violet) ─────────────────────────────────────────────────
  {
    key: "A_to_B",
    d: "M 275 225 Q 200 330 110 374",
    labelXY: [196, 314],
    color: "#a78bfa",
    markerId: "arr-violet",
  },
  {
    key: "A_to_C",
    d: "M 425 225 Q 500 330 590 374",
    labelXY: [504, 314],
    color: "#a78bfa",
    markerId: "arr-violet",
  },
  // ── storage transfer (green) ──────────────────────────────────────────────
  {
    key: "B_to_C",
    d: "M 175 400 Q 350 432 525 400",
    labelXY: [350, 414],
    color: "#4ade80",
    markerId: "arr-green",
  },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function ArrowMarkers() {
  return (
    <defs>
      {MARKERS.map(({ id, color }) => (
        <marker
          key={id}
          id={id}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      ))}
    </defs>
  );
}

interface FlowArrowProps {
  flow: FlowDef;
  value: number;
}

function FlowArrow({ flow, value }: FlowArrowProps) {
  const [lx, ly] = flow.labelXY;
  const chipW = 46;
  const chipH = 17;

  return (
    <g>
      <path
        d={flow.d}
        fill="none"
        stroke={flow.color}
        strokeWidth={1.5}
        strokeOpacity={0.5}
        markerEnd={`url(#${flow.markerId})`}
      />
      {/* Value chip */}
      <rect
        x={lx - chipW / 2}
        y={ly - chipH / 2}
        width={chipW}
        height={chipH}
        rx={4}
        fill="#08090d"
        stroke={flow.color}
        strokeWidth={0.5}
        strokeOpacity={0.3}
      />
      <text
        x={lx}
        y={ly}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontFamily="ui-monospace, 'Cascadia Code', monospace"
        fill={flow.color}
        fillOpacity={0.85}
      >
        {value.toFixed(1)}
      </text>
    </g>
  );
}

interface NodeBoxProps {
  cx: number;
  cy: number;
  label: string;
  sublabel: string;
  accentColor: string;
}

function NodeBox({ cx, cy, label, sublabel, accentColor }: NodeBoxProps) {
  const x = cx - NW / 2;
  const y = cy - NH / 2;

  return (
    <g>
      {/* Glass card body */}
      <rect
        x={x}
        y={y}
        width={NW}
        height={NH}
        rx={10}
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth={0.75}
      />
      {/* Top accent bar */}
      <line
        x1={cx - 28}
        y1={y}
        x2={cx + 28}
        y2={y}
        stroke={accentColor}
        strokeWidth={1.5}
        strokeOpacity={0.5}
        strokeLinecap="round"
      />
      {/* Node label */}
      <text
        x={cx}
        y={cy - 7}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={500}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={accentColor}
        fillOpacity={0.9}
      >
        {label}
      </text>
      {/* Sub-label */}
      <text
        x={cx}
        y={cy + 11}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="rgba(255,255,255,0.28)"
      >
        {sublabel}
      </text>
    </g>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5" style={{ color: `${color}99` }}>
      <svg width="16" height="2" className="shrink-0" aria-hidden>
        <line
          x1="0"
          y1="1"
          x2="16"
          y2="1"
          stroke={color}
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />
      </svg>
      {label}
    </span>
  );
}

// ─── main export ──────────────────────────────────────────────────────────────

interface Props {
  data: LumenOutput;
}

export default function EnergyFlowDiagram({ data }: Props) {
  const activeFlows = FLOWS.filter((f) => data[f.key] > 0);

  return (
    <div className="w-full rounded-2xl bg-[#08090d] border border-white/[0.07] p-4">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ overflow: "visible" }}
        aria-label="Energy flow diagram between Grid, House A, House B and House C"
      >
        <ArrowMarkers />

        {/* Arrows render first so nodes sit on top */}
        {activeFlows.map((f) => (
          <FlowArrow key={f.key} flow={f} value={data[f.key] as number} />
        ))}

        {/* Nodes */}
        <NodeBox
          cx={ND.grid.cx}
          cy={ND.grid.cy}
          label="Grid"
          sublabel="Utility"
          accentColor="#38bdf8"
        />
        <NodeBox
          cx={ND.A.cx}
          cy={ND.A.cy}
          label="House A"
          sublabel="Solar + Load"
          accentColor="#e2e8f0"
        />
        <NodeBox
          cx={ND.B.cx}
          cy={ND.B.cy}
          label="House B"
          sublabel="Storage"
          accentColor="#e2e8f0"
        />
        <NodeBox
          cx={ND.C.cx}
          cy={ND.C.cy}
          label="House C"
          sublabel="Load"
          accentColor="#e2e8f0"
        />
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 font-mono text-[10px] tracking-wide">
        <LegendItem color="#38bdf8" label="Grid supply" />
        <LegendItem color="#a78bfa" label="Peer-to-peer" />
        <LegendItem color="#4ade80" label="Storage transfer" />
      </div>
    </div>
  );
}
