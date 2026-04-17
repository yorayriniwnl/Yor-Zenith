"use client";

import { useState } from "react";
import type { LumenInput } from "@/lib/lumen/types";

// ─── Presets ────────────────────────────────────────────────────────────────

type Preset = { label: string; tag: string; values: LumenInput };

const PRESETS: Preset[] = [
  {
    label: "Sunny Day",
    tag: "☀︎",
    values: {
      solar_A: 8.5,
      demand_A: 2.0,
      demand_B: 3.0,
      demand_C: 1.5,
      battery_B: 4.0,
      grid_price: 0.18,
      p2p_price: 0.11,
    },
  },
  {
    label: "Peak Demand",
    tag: "⚡",
    values: {
      solar_A: 1.2,
      demand_A: 5.5,
      demand_B: 6.0,
      demand_C: 4.8,
      battery_B: 1.0,
      grid_price: 0.42,
      p2p_price: 0.28,
    },
  },
  {
    label: "Battery Assist",
    tag: "▣",
    values: {
      solar_A: 3.0,
      demand_A: 3.5,
      demand_B: 2.5,
      demand_C: 3.0,
      battery_B: 7.5,
      grid_price: 0.25,
      p2p_price: 0.15,
    },
  },
];

// ─── Field config ────────────────────────────────────────────────────────────

type FieldConfig = {
  key: keyof LumenInput;
  label: string;
  unit: string;
  step: number;
  min: number;
  group: "energy" | "price";
};

const FIELDS: FieldConfig[] = [
  { key: "solar_A",   label: "Solar Output A",  unit: "kWh",   step: 0.1, min: 0, group: "energy" },
  { key: "demand_A",  label: "Demand A",         unit: "kWh",   step: 0.1, min: 0, group: "energy" },
  { key: "demand_B",  label: "Demand B",         unit: "kWh",   step: 0.1, min: 0, group: "energy" },
  { key: "demand_C",  label: "Demand C",         unit: "kWh",   step: 0.1, min: 0, group: "energy" },
  { key: "battery_B", label: "Battery B",        unit: "kWh",   step: 0.1, min: 0, group: "energy" },
  { key: "grid_price",label: "Grid Price",       unit: "Rs/kWh", step: 0.01, min: 0, group: "price" },
  { key: "p2p_price", label: "P2P Price",        unit: "Rs/kWh", step: 0.01, min: 0, group: "price" },
];

const DEFAULT_VALUES: LumenInput = {
  solar_A: 0,
  demand_A: 0,
  demand_B: 0,
  demand_C: 0,
  battery_B: 0,
  grid_price: 0,
  p2p_price: 0,
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldInput({
  config,
  value,
  onChange,
}: {
  config: FieldConfig;
  value: number;
  onChange: (key: keyof LumenInput, value: number) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="group relative">
      {/* Label row */}
      <div className="flex justify-between items-baseline mb-1.5">
        <label
          className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 group-hover:text-slate-400 transition-colors duration-150"
        >
          {config.label}
        </label>
        <span
          className={`text-[10px] font-mono tracking-wide transition-colors duration-150 ${
            focused ? "text-cyan-400" : "text-slate-600"
          }`}
        >
          {config.unit}
        </span>
      </div>

      {/* Input wrapper */}
      <div
        className="relative flex items-center rounded-lg overflow-hidden transition-all duration-150"
        style={{
          background: focused
            ? "rgba(6,182,212,0.06)"
            : "rgba(255,255,255,0.03)",
          border: focused
            ? "1px solid rgba(6,182,212,0.45)"
            : "1px solid rgba(255,255,255,0.07)",
          boxShadow: focused
            ? "0 0 0 3px rgba(6,182,212,0.08), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Left accent bar */}
        <div
          className="w-0.5 self-stretch shrink-0 transition-all duration-150"
          style={{
            background: focused
              ? "rgba(6,182,212,0.8)"
              : "rgba(255,255,255,0.06)",
          }}
        />

        <input
          type="number"
          value={value}
          step={config.step}
          min={config.min}
          onChange={(e) =>
            onChange(config.key, parseFloat(e.target.value) || 0)
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-3 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-700 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        {/* Stepper controls */}
        <div className="flex flex-col border-l border-white/[0.05] shrink-0">
          {[
            { dir: 1, icon: "▲" },
            { dir: -1, icon: "▼" },
          ].map(({ dir, icon }) => (
            <button
              key={dir}
              onClick={() =>
                onChange(
                  config.key,
                  Math.max(
                    config.min,
                    parseFloat(
                      (value + dir * config.step).toFixed(
                        config.step < 0.1 ? 2 : 1
                      )
                    )
                  )
                )
              }
              className="px-2.5 py-1 text-[8px] text-slate-600 hover:text-cyan-400 hover:bg-cyan-400/5 transition-all duration-100 leading-none select-none"
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

type ScenarioFormProps = {
  onSubmitAction: (data: LumenInput) => void;
};

export default function ScenarioForm({ onSubmitAction }: ScenarioFormProps) {
  const [values, setValues] = useState<LumenInput>(DEFAULT_VALUES);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  function handleChange(key: keyof LumenInput, val: number) {
    setActivePreset(null);
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function applyPreset(preset: Preset) {
    setActivePreset(preset.label);
    setValues(preset.values);
  }

  const energyFields = FIELDS.filter((f) => f.group === "energy");
  const priceFields = FIELDS.filter((f) => f.group === "price");

  return (
    <div
      className="w-full max-w-md rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, rgba(15,20,30,0.98) 0%, rgba(10,14,22,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 24px 64px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset",
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-1.5 h-5 rounded-full"
            style={{
              background: "linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)",
              boxShadow: "0 0 8px rgba(34,211,238,0.5)",
            }}
          />
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-200">
            Scenario Config
          </h2>
        </div>
        <p className="text-[11px] text-slate-600 mt-1.5 ml-4 tracking-wide">
          Configure energy inputs and run optimization
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Presets ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-2.5">
            Quick Presets
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.label;
              return (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="relative flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 text-center transition-all duration-200 group overflow-hidden"
                  style={{
                    background: isActive
                      ? "rgba(6,182,212,0.1)"
                      : "rgba(255,255,255,0.03)",
                    border: isActive
                      ? "1px solid rgba(6,182,212,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: isActive
                      ? "0 0 16px rgba(6,182,212,0.1), inset 0 1px 0 rgba(6,182,212,0.15)"
                      : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* active glow layer */}
                  {isActive && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.12) 0%, transparent 70%)",
                      }}
                    />
                  )}
                  <span
                    className={`text-base leading-none transition-colors duration-150 ${
                      isActive ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {preset.tag}
                  </span>
                  <span
                    className={`text-[10px] font-semibold tracking-wide transition-colors duration-150 ${
                      isActive ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Energy inputs ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-3">
            Energy · kWh
          </p>
          <div className="grid grid-cols-2 gap-3">
            {energyFields.map((field) => (
              <FieldInput
                key={field.key}
                config={field}
                value={values[field.key]}
                onChange={handleChange}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)",
          }}
        />

        {/* ── Price inputs ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-3">
            Pricing · Rs/kWh
          </p>
          <div className="grid grid-cols-2 gap-3">
            {priceFields.map((field) => (
              <FieldInput
                key={field.key}
                config={field}
                value={values[field.key]}
                onChange={handleChange}
              />
            ))}
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          onClick={() => onSubmitAction(values)}
          className="relative w-full rounded-xl py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-900 overflow-hidden transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)",
            boxShadow:
              "0 4px 20px rgba(6,182,212,0.35), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          {/* shimmer layer */}
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
            }}
          />
          <span className="relative flex items-center justify-center gap-2">
            <span
              className="w-1 h-1 rounded-full bg-slate-900/40"
              aria-hidden="true"
            />
            Run Optimization
            <span
              className="w-1 h-1 rounded-full bg-slate-900/40"
              aria-hidden="true"
            />
          </span>
        </button>
      </div>
    </div>
  );
}