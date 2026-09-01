"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ArrowUpRight, MoveHorizontal, RotateCcw } from "lucide-react";
import { calculateSolarBenefits } from "@/lib/solarCalculations";
import { workspaceEntryHref } from "@/lib/workspaceNavigation";
import SolarRoof from "./SolarRoof";

const presets = [2000, 4000, 8000];
const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function SolarPreview() {
  const [monthlyBill, setMonthlyBill] = useState(4000);
  const result = calculateSolarBenefits({
    monthlyBill,
    tariffPerKWh: 8,
    offsetFactor: 0.8,
    feasibilityScore: 8,
  });

  return (
    <section className="solar-preview" aria-labelledby="preview-heading">
      <div className="preview-topline">
        <span>
          <span className="status-dot" />
          ROOFTOP STUDY / 01
        </span>
        <span className="preview-badge">Interactive sample</span>
      </div>
      <div className="preview-scene">
        <div className="preview-scene-heading">
          <p>THE POTENTIAL ABOVE YOU</p>
          <h2 id="preview-heading">A new perspective.</h2>
        </div>
        <SolarRoof panels={result.numberOfPanels} />
        <div className="preview-coordinate">
          <span>CONCEPTUAL LAYOUT</span>
          <span>NOT A SITE DESIGN</span>
        </div>
      </div>
      <div className="preview-controls">
        <div className="preview-bill-label">
          <label htmlFor="preview-bill">Monthly electricity bill</label>
          <output htmlFor="preview-bill" className="tabular-nums">
            {currency(monthlyBill)}
          </output>
        </div>
        <input
          id="preview-bill"
          type="range"
          min="1000"
          max="12000"
          step="250"
          value={monthlyBill}
          onChange={(event) => setMonthlyBill(Number(event.target.value))}
          aria-valuetext={`${currency(monthlyBill)} per month`}
          aria-describedby="preview-assumptions"
          className="studio-range"
          style={
            {
              "--range-progress": `${((monthlyBill - 1000) / 11000) * 100}%`,
            } as CSSProperties
          }
        />
        <div className="preview-presets">
          <span>
            <MoveHorizontal size={13} aria-hidden="true" />
            Try your bill
          </span>
          <div>
            {presets.map((amount) => (
              <button
                type="button"
                key={amount}
                onClick={() => setMonthlyBill(amount)}
                aria-pressed={monthlyBill === amount}
              >
                {currency(amount)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setMonthlyBill(4000)}
              aria-label="Reset sample bill"
              title="Reset sample bill"
            >
              <RotateCcw size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
        <dl className="preview-results" aria-live="polite" aria-atomic="true">
          <div>
            <dt>System size</dt>
            <dd>
              {result.systemSizeKW.toFixed(1)}
              <span> kW</span>
            </dd>
          </div>
          <div>
            <dt>Annual net savings</dt>
            <dd>{currency(result.annualSavings)}</dd>
          </div>
          <div>
            <dt>Simple payback</dt>
            <dd>
              {result.paybackYears === null
                ? "N/A"
                : result.paybackYears.toFixed(1)}
              <span> yrs</span>
            </dd>
          </div>
        </dl>
        <details className="preview-assumptions" id="preview-assumptions">
          <summary>Sample assumptions, not a quote</summary>
          <p>
            ₹8/kWh tariff, 80% bill offset, 4.5 production units/kW/day at 80%
            model efficiency, 550 W panels and 1% annual maintenance. Tiered
            installation costs plus ₹25,000 fixed cost. No subsidy applied. Roof
            fit, local generation and export tariffs are not verified.
          </p>
        </details>
        <Link
          href={workspaceEntryHref(`/service1?bill=${monthlyBill}`)}
          className="preview-continue"
        >
          Use this bill in a full assessment
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
