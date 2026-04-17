import { useState } from "react";
import type { LumenInput } from "@/lib/lumen/types";

type Preset = {
  label: string;
  tag: string;
  values: LumenInput;
};

type FieldConfig = {
  key: keyof LumenInput;
  label: string;
  unit: string;
  step: number;
  min: number;
  group: "energy" | "price";
};

const PRESETS: Preset[] = [
  {
    label: "Sunny Day",
    tag: "SUN",
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
    tag: "PEAK",
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
    tag: "BATT",
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

const FIELDS: FieldConfig[] = [
  { key: "solar_A", label: "Solar Output A", unit: "kWh", step: 0.1, min: 0, group: "energy" },
  { key: "demand_A", label: "Demand A", unit: "kWh", step: 0.1, min: 0, group: "energy" },
  { key: "demand_B", label: "Demand B", unit: "kWh", step: 0.1, min: 0, group: "energy" },
  { key: "demand_C", label: "Demand C", unit: "kWh", step: 0.1, min: 0, group: "energy" },
  { key: "battery_B", label: "Battery B", unit: "kWh", step: 0.1, min: 0, group: "energy" },
  { key: "grid_price", label: "Grid Price", unit: "Rs/kWh", step: 0.01, min: 0, group: "price" },
  { key: "p2p_price", label: "P2P Price", unit: "Rs/kWh", step: 0.01, min: 0, group: "price" },
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

function formatNextValue(value: number, step: number) {
  return Number(step.toString().split(".")[1]?.length ?? 0) > 0 ? Number(value.toFixed(2)) : value;
}

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

  function adjust(delta: number) {
    const nextValue = Math.max(config.min, formatNextValue(value + delta * config.step, config.step));
    onChange(config.key, nextValue);
  }

  return (
    <div className="group relative">
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 transition-colors duration-150 group-hover:text-slate-400">
          {config.label}
        </label>
        <span className={`text-[10px] font-mono tracking-wide ${focused ? "text-cyan-300" : "text-slate-600"}`}>
          {config.unit}
        </span>
      </div>

      <div
        className="relative flex items-center overflow-hidden rounded-xl transition-all duration-150"
        style={{
          background: focused ? "rgba(30,203,255,0.06)" : "rgba(255,255,255,0.03)",
          border: focused ? "1px solid rgba(30,203,255,0.4)" : "1px solid rgba(255,255,255,0.07)",
          boxShadow: focused
            ? "0 0 0 3px rgba(30,203,255,0.08), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div
          className="w-0.5 self-stretch shrink-0"
          style={{ background: focused ? "rgba(20,214,162,0.85)" : "rgba(255,255,255,0.06)" }}
        />
        <input
          type="number"
          value={value}
          min={config.min}
          step={config.step}
          onChange={(event) => onChange(config.key, parseFloat(event.target.value) || 0)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-3 py-3 text-sm font-mono text-slate-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <div className="flex shrink-0 flex-col border-l border-white/[0.05]">
          <button
            type="button"
            onClick={() => adjust(1)}
            className="px-2.5 py-1 text-[8px] text-slate-500 transition hover:bg-cyan-400/[0.06] hover:text-cyan-300"
          >
            UP
          </button>
          <button
            type="button"
            onClick={() => adjust(-1)}
            className="px-2.5 py-1 text-[8px] text-slate-500 transition hover:bg-cyan-400/[0.06] hover:text-cyan-300"
          >
            DN
          </button>
        </div>
      </div>
    </div>
  );
}

type ScenarioFormProps = {
  onSubmit: (data: LumenInput) => void;
};

export default function ScenarioForm({ onSubmit }: ScenarioFormProps) {
  const [values, setValues] = useState<LumenInput>(DEFAULT_VALUES);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const energyFields = FIELDS.filter((field) => field.group === "energy");
  const priceFields = FIELDS.filter((field) => field.group === "price");

  function handleChange(key: keyof LumenInput, value: number) {
    setActivePreset(null);
    setValues((current) => ({ ...current, [key]: value }));
  }

  function applyPreset(preset: Preset) {
    setActivePreset(preset.label);
    setValues(preset.values);
  }

  return (
    <div
      className="w-full overflow-hidden rounded-[1.75rem]"
      style={{
        background: "linear-gradient(160deg, rgba(10,18,20,0.98) 0%, rgba(7,13,16,0.98) 100%)",
        border: "1px solid rgba(29,65,61,0.95)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset",
      }}
    >
      <div className="border-b border-white/[0.05] px-5 pb-4 pt-5">
        <div className="flex items-center gap-2.5">
          <div
            className="h-5 w-1.5 rounded-full"
            style={{
              background: "linear-gradient(180deg, #14d6a2 0%, #1ecbff 100%)",
              boxShadow: "0 0 12px rgba(30,203,255,0.28)",
            }}
          />
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-200">
            Scenario Config
          </h2>
        </div>
        <p className="ml-4 mt-1.5 text-[11px] tracking-wide text-slate-500">
          Configure energy inputs and run optimization
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
            Quick Presets
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.label;

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="relative overflow-hidden rounded-xl px-2 py-3 text-center transition-all duration-200"
                  style={{
                    background: isActive ? "rgba(30,203,255,0.1)" : "rgba(255,255,255,0.03)",
                    border: isActive ? "1px solid rgba(30,203,255,0.35)" : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: isActive
                      ? "0 0 16px rgba(30,203,255,0.08), inset 0 1px 0 rgba(30,203,255,0.15)"
                      : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {isActive && (
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: "radial-gradient(ellipse at 50% 0%, rgba(30,203,255,0.12) 0%, transparent 70%)",
                      }}
                    />
                  )}
                  <div className={`relative text-[11px] font-bold uppercase tracking-[0.22em] ${isActive ? "text-cyan-300" : "text-slate-500"}`}>
                    {preset.tag}
                  </div>
                  <div className={`relative mt-1 text-[10px] font-semibold ${isActive ? "text-cyan-300" : "text-slate-400"}`}>
                    {preset.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
            Energy - kWh
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)",
          }}
        />

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
            Pricing - Rs/kWh
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        <button
          type="button"
          onClick={() => onSubmit(values)}
          className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-950 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #14d6a2 0%, #1ecbff 52%, #37bcff 100%)",
            boxShadow: "0 4px 20px rgba(30,203,255,0.2), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.16) 50%, transparent 60%)",
            }}
          />
          <span className="relative flex items-center justify-center gap-2">
            <span className="h-1 w-1 rounded-full bg-slate-950/40" aria-hidden="true" />
            Run Optimization
            <span className="h-1 w-1 rounded-full bg-slate-950/40" aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  );
}
