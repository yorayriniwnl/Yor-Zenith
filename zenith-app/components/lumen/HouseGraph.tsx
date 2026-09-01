"use client";

import type { LumenOutput } from "@/lib/lumen/types";

interface HouseGraphProps {
  data: LumenOutput;
  isRunning?: boolean;
}

export default function HouseGraph({ data, isRunning }: HouseGraphProps) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-[#050808]/95 backdrop-blur-sm p-6 md:p-8 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-300">
          ⚡ Microgrid Houses
        </h3>
        {isRunning && (
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
            </span>
            Optimizing
          </span>
        )}
      </div>

      {/* SVG Microgrid visualization */}
      <svg viewBox="0 0 800 300" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Background grid lines (subtle) */}
        <defs>
          <linearGradient id="solarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid/Ground line */}
        <line x1="50" y1="250" x2="750" y2="250" stroke="white" strokeOpacity="0.1" strokeWidth="2" />

        {/* HOUSE A (left) - Solar Producer */}
        <g>
          {/* Solar panel on roof */}
          <rect x="80" y="80" width="100" height="12" rx="2" fill="url(#solarGradient)" />
          <text x="130" y="98" textAnchor="middle" className="fill-yellow-300 text-xs font-bold">
            ☀ 6.2 kW
          </text>

          {/* House outline */}
          <rect x="60" y="120" width="140" height="120" rx="8" fill="#0a2a35" stroke="#22d3ee" strokeWidth="2" opacity="0.7" />

          {/* Door */}
          <rect x="115" y="180" width="40" height="60" rx="4" fill="#1a1a1a" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />

          {/* Windows */}
          <rect x="75" y="135" width="25" height="25" fill="#38bdf8" opacity="0.6" />
          <rect x="155" y="135" width="25" height="25" fill="#38bdf8" opacity="0.6" />

          {/* House label */}
          <text x="130" y="260" textAnchor="middle" className="fill-cyan-300 text-sm font-bold">
            House A
          </text>
          <text x="130" y="280" textAnchor="middle" className="fill-cyan-200 text-xs">
            Producer
          </text>
        </g>

        {/* HOUSE B (middle) - Consumer */}
        <g>
          {/* House outline */}
          <rect x="350" y="120" width="140" height="120" rx="8" fill="#1a2a3a" stroke="#38bdf8" strokeWidth="2" opacity="0.7" />

          {/* Door */}
          <rect x="405" y="180" width="40" height="60" rx="4" fill="#1a1a1a" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />

          {/* Windows */}
          <rect x="365" y="135" width="25" height="25" fill="#38bdf8" opacity="0.6" />
          <rect x="445" y="135" width="25" height="25" fill="#38bdf8" opacity="0.6" />

          {/* House label */}
          <text x="420" y="260" textAnchor="middle" className="fill-cyan-300 text-sm font-bold">
            House B
          </text>
          <text x="420" y="280" textAnchor="middle" className="fill-cyan-200 text-xs">
            Consumer
          </text>
        </g>

        {/* HOUSE C (right) - Consumer */}
        <g>
          {/* House outline */}
          <rect x="640" y="120" width="140" height="120" rx="8" fill="#1a2a3a" stroke="#38bdf8" strokeWidth="2" opacity="0.7" />

          {/* Door */}
          <rect x="695" y="180" width="40" height="60" rx="4" fill="#1a1a1a" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />

          {/* Windows */}
          <rect x="655" y="135" width="25" height="25" fill="#38bdf8" opacity="0.6" />
          <rect x="735" y="135" width="25" height="25" fill="#38bdf8" opacity="0.6" />

          {/* House label */}
          <text x="710" y="260" textAnchor="middle" className="fill-cyan-300 text-sm font-bold">
            House C
          </text>
          <text x="710" y="280" textAnchor="middle" className="fill-cyan-200 text-xs">
            Consumer
          </text>
        </g>

        {/* Energy flow arrows A → B */}
        <g>
          <defs>
            <marker id="arrowHeadGreen" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#4ade80" />
            </marker>
          </defs>
          <line
            x1="200"
            y1="170"
            x2="350"
            y2="170"
            stroke="#4ade80"
            strokeWidth="3"
            opacity={isRunning ? 0.4 : 0.8}
            markerEnd="url(#arrowHeadGreen)"
            className={isRunning ? "animate-pulse" : ""}
          />
          <text x="275" y="160" textAnchor="middle" className="fill-emerald-400 text-xs font-semibold">
            {data.A_to_B.toFixed(1)} kWh
          </text>
        </g>

        {/* Energy flow arrows A → C */}
        <g>
          <path
            d="M 210 180 Q 420 120 640 170"
            stroke="#4ade80"
            strokeWidth="2"
            fill="none"
            opacity={isRunning ? 0.4 : 0.7}
            markerEnd="url(#arrowHeadGreen)"
            className={isRunning ? "animate-pulse" : ""}
          />
          <text x="420" y="110" textAnchor="middle" className="fill-emerald-400 text-xs font-semibold">
            {data.A_to_C.toFixed(1)} kWh
          </text>
        </g>

        {/* Energy flow B → C */}
        <g>
          <line
            x1="490"
            y1="170"
            x2="640"
            y2="170"
            stroke="#4ade80"
            strokeWidth="3"
            opacity={isRunning ? 0.4 : 0.8}
            markerEnd="url(#arrowHeadGreen)"
            className={isRunning ? "animate-pulse" : ""}
          />
          <text x="565" y="160" textAnchor="middle" className="fill-emerald-400 text-xs font-semibold">
            {data.B_to_C.toFixed(1)} kWh
          </text>
        </g>

        {/* Grid connection (bottom) */}
        <g>
          <rect x="350" y="250" width="120" height="30" rx="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" />
          <text x="410" y="270" textAnchor="middle" className="fill-slate-400 text-xs font-bold">
            🔌 Grid
          </text>
        </g>

        {/* Grid arrows - B to/from grid */}
        <line x1="420" y1="240" x2="420" y2="250" stroke="#94a3b8" strokeWidth="2" opacity="0.5" />
        <text x="430" y="245" className="fill-slate-400 text-[10px]">
          {data.grid_to_B.toFixed(1)} kW
        </text>

        {/* Summary text */}
        <text x="400" y="20" textAnchor="middle" className="fill-white text-sm font-semibold">
          P2P Energy Distribution
        </text>
        <text x="400" y="40" textAnchor="middle" className="fill-gray-400 text-xs">
          Real-time peer-to-peer trading optimization
        </text>
      </svg>

      {/* Stats footer */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-cyan-400/10">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-cyan-400/70 font-semibold mb-1">
            Grid Reduction
          </p>
          <p className="text-lg font-bold text-cyan-300">{(data.efficiency_gain_percent || 0).toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-cyan-400/70 font-semibold mb-1">
            Total Savings
          </p>
          <p className="text-lg font-bold text-emerald-400">₹{data.savings.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-cyan-400/70 font-semibold mb-1">
            Optimized Cost
          </p>
          <p className="text-lg font-bold text-cyan-300">₹{data.total_cost.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
