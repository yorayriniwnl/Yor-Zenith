"use client";

import { useState, useEffect, useRef } from "react";
import type { LumenOutput } from "@/lib/lumen/types";

// ─── Coordinate System ───────────────────────────────────────────────────────
// SVG viewBox: 0 0 720 500  (matches HTML % below)
// Card half-dims: ~60w × 44h in SVG units

const VW = 720;
const VH = 500;

const SVG_NODE = {
  grid:    { x: 360, y: 34  },
  houseA:  { x: 108, y: 262 },
  houseB:  { x: 360, y: 165 },
  houseC:  { x: 612, y: 262 },
  battery: { x: 360, y: 432 },
};

// Percentage positions for absolute HTML cards
const HTML_POS = {
  grid:    { left: "50%",  top: "6.8%"  },
  houseA:  { left: "15%",  top: "52.4%" },
  houseB:  { left: "50%",  top: "33%"   },
  houseC:  { left: "85%",  top: "52.4%" },
  battery: { left: "50%",  top: "86.4%" },
};

// ─── Flow Definitions ─────────────────────────────────────────────────────────

type FlowKey = "A_to_B" | "A_to_C" | "B_to_C" | "grid_to_A" | "grid_to_B" | "grid_to_C";

interface FlowDef {
  key: FlowKey;
  path: string;
  labelXY: [number, number];
  type: "p2p" | "grid";
}

const FLOWS: FlowDef[] = [
  // Grid supply (amber)
  {
    key: "grid_to_A",
    path: "M 300,78 Q 90,155 168,242",
    labelXY: [162, 158],
    type: "grid",
  },
  {
    key: "grid_to_B",
    path: "M 360,78 L 360,121",
    labelXY: [386, 100],
    type: "grid",
  },
  {
    key: "grid_to_C",
    path: "M 420,78 Q 630,155 552,242",
    labelXY: [558, 158],
    type: "grid",
  },
  // P2P transfer (cyan)
  {
    key: "A_to_B",
    path: "M 168,230 Q 235,165 300,165",
    labelXY: [235, 181],
    type: "p2p",
  },
  {
    key: "A_to_C",
    path: "M 168,270 Q 360,320 552,270",
    labelXY: [360, 299],
    type: "p2p",
  },
  {
    key: "B_to_C",
    path: "M 420,165 Q 510,195 552,232",
    labelXY: [498, 197],
    type: "p2p",
  },
];

// ─── CSS Keyframes ────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes node-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-7px); }
  }
  @keyframes pulse-ring-expand {
    0%   { transform: scale(0.88); opacity: 0.8; }
    100% { transform: scale(1.4);  opacity: 0; }
  }
  @keyframes glow-cyan {
    0%, 100% {
      box-shadow: 0 0 10px 2px rgba(34,211,238,0.22),
                  0 0 24px 4px rgba(34,211,238,0.10),
                  inset 0 1px 0 rgba(34,211,238,0.12);
    }
    50% {
      box-shadow: 0 0 22px 5px rgba(34,211,238,0.52),
                  0 0 48px 10px rgba(34,211,238,0.18),
                  inset 0 1px 0 rgba(34,211,238,0.28);
    }
  }
  @keyframes glow-green {
    0%, 100% {
      box-shadow: 0 0 10px 2px rgba(74,222,128,0.22),
                  0 0 24px 4px rgba(74,222,128,0.10),
                  inset 0 1px 0 rgba(74,222,128,0.12);
    }
    50% {
      box-shadow: 0 0 22px 5px rgba(74,222,128,0.52),
                  0 0 48px 10px rgba(74,222,128,0.18),
                  inset 0 1px 0 rgba(74,222,128,0.28);
    }
  }
  @keyframes glow-amber {
    0%, 89%, 92%, 95%, 100% {
      box-shadow: 0 0 12px 3px rgba(251,191,36,0.28),
                  0 0 28px 6px rgba(251,191,36,0.12),
                  inset 0 1px 0 rgba(251,191,36,0.14);
    }
    90% {
      box-shadow: 0 0 3px 1px rgba(251,191,36,0.08),
                  0 0 8px  2px rgba(251,191,36,0.05),
                  inset 0 1px 0 rgba(251,191,36,0.04);
    }
    93% {
      box-shadow: 0 0 26px 6px rgba(251,191,36,0.55),
                  0 0 52px 12px rgba(251,191,36,0.20),
                  inset 0 1px 0 rgba(251,191,36,0.30);
    }
  }
  @keyframes glow-purple {
    0%, 100% {
      box-shadow: 0 0 10px 2px rgba(167,139,250,0.22),
                  0 0 24px 4px rgba(167,139,250,0.10),
                  inset 0 1px 0 rgba(167,139,250,0.12);
    }
    50% {
      box-shadow: 0 0 22px 5px rgba(167,139,250,0.52),
                  0 0 48px 10px rgba(167,139,250,0.18),
                  inset 0 1px 0 rgba(167,139,250,0.28);
    }
  }
  @keyframes glow-yellow {
    0%, 100% {
      box-shadow: 0 0 10px 2px rgba(251,191,36,0.22),
                  0 0 24px 4px rgba(251,191,36,0.10),
                  inset 0 1px 0 rgba(251,191,36,0.12);
    }
    50% {
      box-shadow: 0 0 20px 4px rgba(251,191,36,0.44),
                  0 0 40px 8px rgba(251,191,36,0.16),
                  inset 0 1px 0 rgba(251,191,36,0.24);
    }
  }
  @keyframes flow-draw {
    from { stroke-dashoffset: 2000; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes flow-anim-p2p {
    from { stroke-dashoffset: 36; }
    to   { stroke-dashoffset: 0;  }
  }
  @keyframes flow-anim-grid {
    from { stroke-dashoffset: 36; }
    to   { stroke-dashoffset: 0;  }
  }
  @keyframes label-appear {
    0%   { opacity: 0; transform: scale(0.6); }
    70%  { transform: scale(1.08); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes diagram-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0px);  }
  }
  @keyframes battery-fill {
    from { width: 0%; }
    to   { width: var(--batt-fill, 50%); }
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────

function SunIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={12 + 6.5 * Math.cos(r)}
            y1={12 + 6.5 * Math.sin(r)}
            x2={12 + 9 * Math.cos(r)}
            y2={12 + 9 * Math.sin(r)}
          />
        );
      })}
    </svg>
  );
}

function HomeIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" />
      <path d="M9 21V13h6v8" />
    </svg>
  );
}

function BoltIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function GridTowerIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20" />
      <path d="M2 7l10-5 10 5" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 7v10M22 7v10" />
      <path d="M2 12h20" />
    </svg>
  );
}

function BatteryFillIcon({ color, fillPct }: { color: string; fillPct: number }) {
  const innerW = Math.max(0, Math.round((fillPct / 100) * 20));
  return (
    <svg viewBox="0 0 34 18" width="38" height="21" fill="none">
      {/* Outer shell */}
      <rect x="1" y="2" width="28" height="14" rx="3.5" stroke={color} strokeWidth="1.5" fill="rgba(0,0,0,0.25)" />
      {/* Terminal nub */}
      <rect x="30" y="6.5" width="3" height="5" rx="1.5" fill={color} fillOpacity="0.55" />
      {/* Fill bar */}
      <rect
        x="3.5"
        y="4.5"
        width={innerW}
        height="9"
        rx="2"
        fill={color}
        fillOpacity="0.78"
        style={{ transition: "width 1.6s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      {/* Segment dividers */}
      {[8, 14].map((x) => (
        <line key={x} x1={x} y1="4" x2={x} y2="14" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
      ))}
    </svg>
  );
}

// ─── Node Card ────────────────────────────────────────────────────────────────

interface NodeCardProps {
  pos: { left: string; top: string };
  glowAnim: string;
  glowAnimDuration: string;
  floatDelay?: string;
  hasPulseRing?: boolean;
  pulseRingColor?: string;
  active: boolean;
  activeGlow: string; // rgba string used when active
  children: React.ReactNode;
  borderColor: string;
}

function NodeCard({
  pos,
  glowAnim,
  glowAnimDuration,
  floatDelay = "0s",
  hasPulseRing,
  pulseRingColor,
  active,
  activeGlow,
  children,
  borderColor,
}: NodeCardProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        zIndex: 10,
      }}
    >
      {/* Float wrapper */}
      <div
        style={{
          transform: "translate(-50%, -50%)",
          animation: `node-float 5.5s ease-in-out ${floatDelay} infinite`,
        }}
      >
        {/* Pulse ring (House A only) */}
        {hasPulseRing && pulseRingColor && (
          <>
            <div
              style={{
                position: "absolute",
                inset: "-14px",
                borderRadius: "22px",
                border: `1.5px solid ${pulseRingColor}`,
                animation: "pulse-ring-expand 2.4s ease-out infinite",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "-14px",
                borderRadius: "22px",
                border: `1.5px solid ${pulseRingColor}`,
                animation: "pulse-ring-expand 2.4s ease-out 1.2s infinite",
                pointerEvents: "none",
              }}
            />
          </>
        )}

        {/* Card */}
        <div
          style={{
            background: "linear-gradient(148deg, rgba(16,22,36,0.97) 0%, rgba(8,11,18,0.99) 100%)",
            border: `1px solid ${borderColor}`,
            borderRadius: "16px",
            padding: "12px 14px",
            minWidth: "108px",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            animation: `${glowAnim} ${glowAnimDuration} ease-in-out infinite`,
            filter: active
              ? `drop-shadow(0 0 12px ${activeGlow})`
              : "none",
            transition: "filter 0.5s ease",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Flow Line ────────────────────────────────────────────────────────────────

type AnimPhase = "draw" | "flow";

interface FlowLineProps {
  flow: FlowDef;
  value: number;
  index: number;
  phase: AnimPhase;
}

function FlowLine({ flow, value, index, phase }: FlowLineProps) {
  const isP2P = flow.type === "p2p";
  const color = isP2P ? "#22d3ee" : "#fbbf24";
  const glowHex = isP2P ? "rgba(34,211,238,0.55)" : "rgba(251,191,36,0.55)";
  const strokeW = Math.max(1.5, Math.min(5.5, value * 1.0));
  const staggerDelay = `${index * 200}ms`;
  const [lx, ly] = flow.labelXY;

  return (
    <g>
      {/* Ambient trace — always visible */}
      <path
        d={flow.path}
        fill="none"
        stroke={color}
        strokeWidth={strokeW * 0.55}
        strokeOpacity={0.1}
      />

      {phase === "draw" ? (
        /* ── Draw-in phase ── */
        <path
          d={flow.path}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeOpacity={0.9}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 5px ${glowHex})`,
            strokeDasharray: 2000,
            strokeDashoffset: 2000,
            animation: `flow-draw 0.75s cubic-bezier(0.4,0,0.2,1) ${staggerDelay} forwards`,
          }}
        />
      ) : (
        /* ── Flow phase ── */
        <>
          {/* Solid dim base */}
          <path
            d={flow.path}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeOpacity={0.22}
          />
          {/* Animated dashes */}
          <path
            d={flow.path}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray="10 7"
            style={{
              filter: `drop-shadow(0 0 4px ${glowHex})`,
              animation: `flow-anim-${flow.type} 1.1s linear infinite`,
            }}
          />
        </>
      )}

      {/* kWh label chip — only in flow phase */}
      {phase === "flow" && (
        <g style={{ animation: "label-appear 0.35s ease-out forwards" }}>
          <rect
            x={lx - 24}
            y={ly - 10}
            width={48}
            height={20}
            rx={6}
            fill="rgba(4,7,14,0.92)"
            stroke={color}
            strokeWidth={0.8}
            strokeOpacity={0.55}
          />
          <text
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontFamily="ui-monospace,'Cascadia Code','Fira Mono',monospace"
            fill={color}
            fillOpacity={0.92}
          >
            {value.toFixed(1)} kWh
          </text>
        </g>
      )}
    </g>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  data: LumenOutput;
}

export default function EnergyFlowDiagram({ data }: Props) {
  const [phase, setPhase] = useState<AnimPhase>("draw");
  const [visible, setVisible] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset and replay on new data
    setPhase("draw");
    setVisible(false);
    setAnimKey((k) => k + 1);

    // Fade in the container
    const raf = requestAnimationFrame(() => setVisible(true));

    // After all lines have drawn (stagger + draw duration), switch to flow
    const activeCount = FLOWS.filter((f) => (data[f.key] as number) > 0).length;
    const maxDelay = (activeCount - 1) * 200;
    phaseTimer.current = setTimeout(() => setPhase("flow"), maxDelay + 900);

    return () => {
      cancelAnimationFrame(raf);
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
    };
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeFlows = FLOWS.filter((f) => (data[f.key] as number) > 0);

  // Derive battery charge from energy received by House B
  const batteryFill = Math.round(
    Math.min(100, Math.max(10, ((data.A_to_B + data.grid_to_B) / 8) * 100))
  );

  const active = {
    grid:    data.grid_to_A + data.grid_to_B + data.grid_to_C > 0,
    houseA:  data.A_to_B + data.A_to_C + data.grid_to_A > 0,
    houseB:  data.A_to_B + data.B_to_C + data.grid_to_B > 0,
    houseC:  data.A_to_C + data.B_to_C + data.grid_to_C > 0,
    battery: data.B_to_C > 0,
  };

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div style={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}>
        <div style={{ minWidth: `${VW}px` }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              minHeight: "500px",
              background: "linear-gradient(160deg, #07090f 0%, #050710 100%)",
              border: "1px solid rgba(255,255,255,0.065)",
              borderRadius: "20px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 80px rgba(0,0,0,0.5)",
              overflow: "visible",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
            }}
          >
        {/* ── Background grid texture ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />

        {/* ── SVG overlay for flow lines ── */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
            zIndex: 1,
          }}
          aria-hidden="true"
        >
          {activeFlows.map((flow, i) => (
            <FlowLine
              key={`${animKey}-${flow.key}`}
              flow={flow}
              value={data[flow.key] as number}
              index={i}
              phase={phase}
            />
          ))}
        </svg>

        {/* ── Node: Grid ── */}
        <NodeCard
          pos={HTML_POS.grid}
          glowAnim="glow-yellow"
          glowAnimDuration="3.8s"
          floatDelay="0.4s"
          active={active.grid}
          activeGlow="rgba(251,191,36,0.55)"
          borderColor={active.grid ? "rgba(251,191,36,0.28)" : "rgba(255,255,255,0.07)"}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ filter: active.grid ? "drop-shadow(0 0 7px rgba(251,191,36,0.8))" : "none", transition: "filter 0.4s" }}>
              <GridTowerIcon color={active.grid ? "#fbbf24" : "#6b7280"} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: active.grid ? "#fbbf24" : "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 0.4s" }}>Grid</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.26)", marginTop: -2 }}>Utility Supply</span>
          </div>
        </NodeCard>

        {/* ── Node: House A — Solar Surplus — CYAN ── */}
        <NodeCard
          pos={HTML_POS.houseA}
          glowAnim="glow-cyan"
          glowAnimDuration="3.5s"
          floatDelay="0s"
          hasPulseRing
          pulseRingColor="rgba(34,211,238,0.5)"
          active={active.houseA}
          activeGlow="rgba(34,211,238,0.6)"
          borderColor={active.houseA ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.07)"}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ filter: active.houseA ? "drop-shadow(0 0 8px rgba(34,211,238,0.85))" : "none", transition: "filter 0.4s" }}>
              <SunIcon color={active.houseA ? "#22d3ee" : "#374151"} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: active.houseA ? "#22d3ee" : "#374151", letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 0.4s" }}>House A</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.26)", marginTop: -2 }}>Solar Surplus</span>
          </div>
        </NodeCard>

        {/* ── Node: House B — Generating — GREEN ── */}
        <NodeCard
          pos={HTML_POS.houseB}
          glowAnim="glow-green"
          glowAnimDuration="4.2s"
          floatDelay="0.9s"
          active={active.houseB}
          activeGlow="rgba(74,222,128,0.55)"
          borderColor={active.houseB ? "rgba(74,222,128,0.28)" : "rgba(255,255,255,0.07)"}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ filter: active.houseB ? "drop-shadow(0 0 8px rgba(74,222,128,0.85))" : "none", transition: "filter 0.4s" }}>
              <HomeIcon color={active.houseB ? "#4ade80" : "#374151"} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: active.houseB ? "#4ade80" : "#374151", letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 0.4s" }}>House B</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.26)", marginTop: -2 }}>Generating</span>
          </div>
        </NodeCard>

        {/* ── Node: House C — Consuming — AMBER ── */}
        <NodeCard
          pos={HTML_POS.houseC}
          glowAnim="glow-amber"
          glowAnimDuration="5.5s"
          floatDelay="1.6s"
          active={active.houseC}
          activeGlow="rgba(251,191,36,0.6)"
          borderColor={active.houseC ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.07)"}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ filter: active.houseC ? "drop-shadow(0 0 8px rgba(251,191,36,0.85))" : "none", transition: "filter 0.4s" }}>
              <BoltIcon color={active.houseC ? "#fbbf24" : "#374151"} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: active.houseC ? "#fbbf24" : "#374151", letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 0.4s" }}>House C</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.26)", marginTop: -2 }}>Consuming</span>
          </div>
        </NodeCard>

        {/* ── Node: Battery — PURPLE ── */}
        <NodeCard
          pos={HTML_POS.battery}
          glowAnim="glow-purple"
          glowAnimDuration="3.2s"
          floatDelay="2.1s"
          active={active.battery}
          activeGlow="rgba(167,139,250,0.55)"
          borderColor={active.battery ? "rgba(167,139,250,0.28)" : "rgba(255,255,255,0.07)"}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ filter: active.battery ? "drop-shadow(0 0 8px rgba(167,139,250,0.8))" : "none", transition: "filter 0.4s" }}>
              <BatteryFillIcon color={active.battery ? "#a78bfa" : "#4b5563"} fillPct={batteryFill} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: active.battery ? "#a78bfa" : "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 0.4s" }}>Battery</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.26)", marginTop: -2 }}>{batteryFill}% charged</span>
          </div>
        </NodeCard>

            {/* ── Legend ── */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 20,
                zIndex: 20,
                background: "rgba(4,6,12,0.72)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 99,
                padding: "5px 14px",
                backdropFilter: "blur(8px)",
              }}
            >
              {[
                { color: "#22d3ee", label: "P2P Transfer",  dash: "5 3" },
                { color: "#fbbf24", label: "Grid Supply",   dash: "5 3" },
              ].map(({ color, label, dash }) => (
                <span
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 9.5,
                    fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                    color: `${color}99`,
                    letterSpacing: "0.07em",
                  }}
                >
                  <svg width="18" height="4">
                    <line
                      x1="0" y1="2" x2="18" y2="2"
                      stroke={color}
                      strokeWidth="1.8"
                      strokeOpacity="0.75"
                      strokeDasharray={dash}
                    />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
