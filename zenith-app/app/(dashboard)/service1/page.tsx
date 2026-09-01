"use client";

import { ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import SolarRoof from "@/components/studio/SolarRoof";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateSolarBenefits } from "@/lib/solarCalculations";
import { useEffect, useState } from "react";
import {
  getFeasibilityScore,
  getInvestmentLabel,
} from "@/lib/feasibilityScores";
import { readZenithProjects, upsertZenithProject } from "@/lib/zenithProjects";

const TARIFF_PER_KWH = 8;
const OFFSET_FACTOR = 0.8; // realistic 80% offset
const SERVICE1_STORAGE_KEY = "service1Data";

function MetricCard({
  title,
  value,
  subtitle,
  highlight = false,
}: {
  title: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`feasibility-metric relative rounded-2xl p-6 overflow-hidden border transition-all
        
        ${
          highlight
            ? "bg-slate-800/80 border-slate-600 shadow-lg shadow-slate-900/50"
            : "bg-slate-900/40 border-slate-800 hover:bg-slate-800/50"
        }`}
    >
      {highlight && (
        <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-[100%] h-[3px] bg-[#ddf8a1] rounded-full" />
      )}

      <p className="text-xs uppercase tracking-wider text-[#F3F4F4]/60">
        {title}
      </p>
      <p className="text-2xl font-bold text-[#F3F4F4] mt-1">{value}</p>
      {subtitle && <p className="text-xs text-[#F3F4F4]/50 mt-1">{subtitle}</p>}
    </div>
  );
}

type Service1StoredData = {
  hasCalculated?: boolean;
  projectId?: string;
  projectName?: string;
  location?: string;
  monthlyBill?: number | "";
  tariffPerKWh?: number | "";
  modeledInput?: {
    monthlyBill: number;
    tariffPerKWh: number;
    location: string;
  } | null;
  results?: {
    systemSizeKW: number;
    numberOfPanels: number;
    installationCost: number;
    annualSavings: number;
    paybackYears: number | null;
    lifetimeProfit: number;
    feasibilityScore: number;
  } | null;
};

function getStoredService1Data(): Service1StoredData {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const saved = localStorage.getItem(SERVICE1_STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default function Service1Page() {
  const router = useRouter();
  const queryString = useSearchParams().toString();
  const [showBillUpload, setShowBillUpload] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [projectId, setProjectId] = useState<string>();
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [monthlyBill, setMonthlyBill] = useState<number | "">("");
  const [tariffPerKWh, setTariffPerKWh] = useState<number | "">(TARIFF_PER_KWH);
  const [error, setError] = useState("");
  const [storageNotice, setStorageNotice] = useState("");
  const [modeledInput, setModeledInput] = useState<{
    monthlyBill: number;
    tariffPerKWh: number;
    location: string;
  } | null>(null);
  const [results, setResults] = useState<null | {
    systemSizeKW: number;
    numberOfPanels: number;
    installationCost: number;
    annualSavings: number;
    paybackYears: number | null;
    lifetimeProfit: number;
    feasibilityScore: number;
  }>(null);
  const [geminiText, setGeminiText] = useState<string>(
    "Build an estimate to see the supporting explanation.",
  );
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [isBillLoading, setIsBillLoading] = useState(false);
  const isModelStale = Boolean(
    hasCalculated &&
    (!modeledInput ||
      monthlyBill !== modeledInput.monthlyBill ||
      tariffPerKWh !== modeledInput.tariffPerKWh ||
      location.trim() !== modeledInput.location.trim()),
  );

  useEffect(() => {
    const query = new URLSearchParams(queryString);
    const projectIdFromQuery = query.get("project");
    const selectedProject = projectIdFromQuery
      ? readZenithProjects().find(
          (project) => project.id === projectIdFromQuery,
        )
      : undefined;

    if (selectedProject) {
      const savedResults = calculateSolarBenefits({
        monthlyBill: selectedProject.monthlyBill,
        tariffPerKWh: selectedProject.tariffPerKWh,
        offsetFactor: OFFSET_FACTOR,
        feasibilityScore: selectedProject.feasibilityScore,
      });

      setProjectId(selectedProject.id);
      setProjectName(selectedProject.name);
      setLocation(selectedProject.location);
      setMonthlyBill(selectedProject.monthlyBill);
      setTariffPerKWh(selectedProject.tariffPerKWh);
      setResults(savedResults);
      setModeledInput({
        monthlyBill: selectedProject.monthlyBill,
        tariffPerKWh: selectedProject.tariffPerKWh,
        location: selectedProject.location,
      });
      setHasCalculated(true);
      setGeminiText(
        "Saved model loaded. Re-run the estimate if you have updated your bill or tariff.",
      );
      setHasHydrated(true);
      return;
    }

    const previewBill = Number(query.get("bill"));
    if (
      query.get("new") === "1" ||
      (query.has("bill") &&
        Number.isFinite(previewBill) &&
        previewBill >= 1000 &&
        previewBill <= 12000)
    ) {
      setProjectId(undefined);
      setProjectName("");
      setLocation("");
      setMonthlyBill(
        query.has("bill") && previewBill >= 1000 && previewBill <= 12000
          ? previewBill
          : "",
      );
      setTariffPerKWh(TARIFF_PER_KWH);
      setResults(null);
      setModeledInput(null);
      setHasCalculated(false);
      setError("");
      setHasHydrated(true);
      return;
    }

    const storedData = getStoredService1Data();

    setHasCalculated(storedData.hasCalculated ?? false);
    setProjectId(
      typeof storedData.projectId === "string"
        ? storedData.projectId
        : undefined,
    );
    setProjectName(
      typeof storedData.projectName === "string" ? storedData.projectName : "",
    );
    setLocation(
      typeof storedData.location === "string" ? storedData.location : "",
    );
    setMonthlyBill(
      typeof storedData.monthlyBill === "number" ? storedData.monthlyBill : "",
    );
    setTariffPerKWh(
      typeof storedData.tariffPerKWh === "number"
        ? storedData.tariffPerKWh
        : TARIFF_PER_KWH,
    );
    setResults(storedData.results ?? null);
    setGeminiText(
      storedData.hasCalculated
        ? "Your draft has been restored. Rebuild the estimate when you want a fresh explanation."
        : "Build an estimate to see the supporting explanation.",
    );
    const baseline = storedData.modeledInput;
    setModeledInput(
      baseline &&
        typeof baseline.monthlyBill === "number" &&
        typeof baseline.tariffPerKWh === "number" &&
        typeof baseline.location === "string"
        ? baseline
        : null,
    );
    setHasHydrated(true);
  }, [queryString]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    try {
      localStorage.setItem(
        SERVICE1_STORAGE_KEY,
        JSON.stringify({
          projectId,
          projectName,
          location,
          monthlyBill,
          tariffPerKWh,
          results,
          hasCalculated,
          modeledInput,
        }),
      );
    } catch {
      setStorageNotice(
        "This browser could not save the draft. You can still model the site, but keep a separate copy of your inputs.",
      );
    }
  }, [
    hasHydrated,
    projectId,
    projectName,
    location,
    monthlyBill,
    tariffPerKWh,
    results,
    hasCalculated,
    modeledInput,
  ]);

  return (
    <div className="studio feasibility-page">
      <header className="feasibility-heading">
        <p className="studio-eyebrow">01 / THE FEASIBILITY STUDIO</p>
        <h1>Your roof, in numbers.</h1>
        <p>
          Build a starting model from your bill. Keep the assumptions close, and
          the next step clear.
        </p>
      </header>
      <ol aria-label="Feasibility workflow" className="feasibility-workflow">
        {[
          ["01", "Set the assumptions", "Your site, bill and tariff"],
          ["02", "Build a baseline", "Sizing and economics"],
          ["03", "Review the decision", "Policy and professional checks"],
        ].map(([number, label, detail], index) => (
          <li
            key={number}
            data-active={index === (hasCalculated && !isModelStale ? 1 : 0)}
          >
            <span>{number}</span>
            <div>
              <strong>{label}</strong>
              <small>{detail}</small>
            </div>
          </li>
        ))}
      </ol>
      {storageNotice && (
        <p className="feasibility-notice" role="status">
          {storageNotice}
        </p>
      )}
      {isModelStale && (
        <p className="feasibility-notice" role="status">
          Your inputs changed. Rebuild the estimate to update your snapshot
          before continuing.
        </p>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        {/* LEFT: Input Card */}
        <div className="feasibility-input-panel lg:col-span-2 bg-[#0A0F0F]/80 backdrop-blur-xl border border-[#1E2A2A] rounded-2xl p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#F3F4F4]">
              Your starting assumptions
            </h2>
            <p className="text-sm text-[#F3F4F4]/50 mt-1">
              Keep the project name and assumptions visible so the result is
              easy to review later.
            </p>
          </div>

          <div className="flex flex-col flex-1 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="project-name"
                className="text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                Project name
              </label>
              <div className="rounded-xl border border-[#2A3737] bg-[#131A1A] px-4 py-3">
                <input
                  id="project-name"
                  maxLength={160}
                  type="text"
                  placeholder="e.g. Home rooftop plan"
                  autoComplete="off"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
              <p className="text-xs text-white/35">
                A clear name makes your saved decision easier to find.
              </p>
            </div>

            <div className="space-y-2">
              {/* Label */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="project-location"
                  className="text-xs font-bold uppercase tracking-widest text-gray-400"
                >
                  Project location
                </label>
              </div>

              {/* Input container */}
              <div className="bg-[#131A1A] border border-[#2A3737] rounded-xl px-4 py-3">
                <input
                  id="project-location"
                  maxLength={120}
                  type="text"
                  placeholder="e.g. Bengaluru or Odisha"
                  autoComplete="address-level2"
                  aria-describedby="location-help"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-sm"
                />
              </div>
              <p id="location-help" className="text-xs text-white/35">
                Use the city or state that appears on your electricity bill.
              </p>
            </div>

            <div className="space-y-2">
              {/* Label */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="monthly-bill"
                  className="text-xs font-bold uppercase tracking-widest text-gray-400"
                >
                  Monthly electricity bill
                </label>

                {/* Optional value chip (can remove later) */}
                {monthlyBill !== "" && (
                  <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-1 rounded-md">
                    ₹ {monthlyBill}
                  </span>
                )}
              </div>

              {/* Input container */}
              <div className="flex items-center gap-2 rounded-xl border border-[#2A3737] bg-[#131A1A] px-4 py-3">
                <span className="text-sm text-white/45" aria-hidden="true">
                  ₹
                </span>
                <input
                  id="monthly-bill"
                  type="number"
                  placeholder="e.g. 2500"
                  min="1"
                  max="10000000"
                  step="1"
                  inputMode="numeric"
                  aria-describedby="bill-help"
                  value={monthlyBill}
                  onChange={(e) =>
                    setMonthlyBill(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-sm"
                />
              </div>
              <p id="bill-help" className="text-xs text-white/35">
                Use your average monthly bill, before solar.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="tariff-per-kwh"
                  className="text-xs font-bold uppercase tracking-widest text-gray-400"
                >
                  Blended tariff
                </label>
                <span className="text-[0.68rem] font-medium text-emerald-300/70">
                  Model assumption
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#2A3737] bg-[#131A1A] px-4 py-3">
                <span className="text-sm text-white/45" aria-hidden="true">
                  ₹
                </span>
                <input
                  id="tariff-per-kwh"
                  type="number"
                  min="1"
                  max="1000"
                  step="0.1"
                  inputMode="decimal"
                  aria-describedby="tariff-help"
                  value={tariffPerKWh}
                  onChange={(e) =>
                    setTariffPerKWh(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
                <span className="shrink-0 text-xs text-white/35">/ kWh</span>
              </div>
              <p id="tariff-help" className="text-xs text-white/35">
                Use the effective rate on your latest bill. Default: ₹
                {TARIFF_PER_KWH}/kWh.
              </p>
            </div>

            {/* AI Bill Upload (Beta) */}

            <p className="text-xs text-[#F3F4F4]/50 text-center mt-2">
              Or upload a bill
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowBillUpload(!showBillUpload)}
                aria-expanded={showBillUpload}
                aria-controls="bill-upload-panel"
                disabled={isBillLoading}
                className="w-full rounded-md border border-[#5F9598]/50 py-2 text-sm text-[#F3F4F4] hover:bg-[#5F9598]/10 transition"
              >
                Upload bill to prefill{" "}
                <span className="text-xs text-emerald-300/70">(beta)</span>
              </button>

              {showBillUpload && (
                <div
                  id="bill-upload-panel"
                  className="relative mt-3 rounded-md border border-dashed border-[#5F9598]/40 p-4 text-center bg-[#061E29]/60"
                >
                  <label
                    htmlFor="bill-image"
                    className="block text-sm text-[#F3F4F4]/80 mb-2"
                  >
                    Upload your electricity bill
                  </label>

                  <input
                    id="bill-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-describedby="bill-upload-help"
                    disabled={isBillLoading}
                    onChange={async (e) => {
                      const fileInput = e.currentTarget;
                      const file = fileInput.files?.[0];
                      if (!file) return;
                      setError("");
                      if (
                        !["image/jpeg", "image/png", "image/webp"].includes(
                          file.type,
                        ) ||
                        file.size === 0 ||
                        file.size > 8 * 1024 * 1024
                      ) {
                        setError(
                          "Choose a JPEG, PNG or WebP bill image up to 8 MB.",
                        );
                        fileInput.value = "";
                        return;
                      }

                      const formData = new FormData();
                      formData.append("file", file);

                      try {
                        setIsBillLoading(true);

                        const res = await fetch("/api/bill-parser", {
                          method: "POST",
                          body: formData,
                        });

                        const data = await res.json();

                        if (
                          res.ok &&
                          Number.isFinite(data.monthlyBill) &&
                          data.monthlyBill > 0 &&
                          data.monthlyBill <= 10_000_000
                        ) {
                          setMonthlyBill(data.monthlyBill);
                          setShowBillUpload(false);
                        } else {
                          setError(
                            "We could not read that bill. Please enter the monthly amount manually.",
                          );
                        }
                      } catch {
                        setError(
                          "Bill upload failed. Please enter the monthly amount manually.",
                        );
                      } finally {
                        setIsBillLoading(false);
                        fileInput.value = "";
                      }
                    }}
                    className="block w-full text-sm text-[#F3F4F4]/70
             file:mr-4 file:py-2 file:px-4
             file:rounded-md file:border-0
             file:text-sm file:font-medium
             file:bg-[#5F9598] file:text-[#061E29]
             hover:file:bg-[#6FAFB2]"
                  />
                  {isBillLoading && (
                    <p className="mt-2 text-xs text-[#F3F4F4]/60">
                      Reading bill…
                    </p>
                  )}

                  <p
                    id="bill-upload-help"
                    className="mt-2 text-xs text-[#F3F4F4]/50"
                  >
                    JPEG, PNG or WebP, up to 8 MB. Sent to the AI bill parser to
                    extract the amount. Check the result before rebuilding.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p
                role="alert"
                aria-live="polite"
                className="text-sm text-red-400 mt-2"
              >
                {error}
              </p>
            )}

            <button
              onClick={async () => {
                setError("");

                if (!location.trim()) {
                  setError("Please enter your location.");
                  return;
                }

                if (monthlyBill === "" || monthlyBill <= 0) {
                  setError(
                    "Please enter your monthly bill or use bill auto-fill.",
                  );
                  return;
                }

                if (tariffPerKWh === "" || tariffPerKWh <= 0) {
                  setError(
                    "Please enter the effective tariff from your latest bill.",
                  );
                  return;
                }

                const FEASIBILITY_SCORE = getFeasibilityScore(location);
                const effectiveTariff = Number(tariffPerKWh);

                let calculationResult: ReturnType<
                  typeof calculateSolarBenefits
                >;
                try {
                  calculationResult = calculateSolarBenefits({
                    monthlyBill,
                    tariffPerKWh: effectiveTariff,
                    offsetFactor: OFFSET_FACTOR,
                    feasibilityScore: FEASIBILITY_SCORE,
                  });
                } catch (calculationError) {
                  setError(
                    calculationError instanceof Error
                      ? calculationError.message
                      : "Check the bill and tariff before rebuilding.",
                  );
                  return;
                }
                setModeledInput({
                  monthlyBill,
                  tariffPerKWh: effectiveTariff,
                  location,
                });

                const investmentLabel = getInvestmentLabel(
                  calculationResult.paybackYears,
                );

                setResults(calculationResult);
                setHasCalculated(true);

                const savedProject = upsertZenithProject({
                  id: projectId,
                  name: projectName.trim() || `${location.trim()} solar plan`,
                  location: location.trim(),
                  monthlyBill,
                  tariffPerKWh: effectiveTariff,
                  systemSizeKW: calculationResult.systemSizeKW,
                  paybackYears: calculationResult.paybackYears,
                  feasibilityScore: calculationResult.feasibilityScore,
                  status: "modeled",
                });
                if (savedProject) {
                  setProjectId(savedProject.id);
                  if (!projectName.trim()) setProjectName(savedProject.name);
                } else {
                  setStorageNotice(
                    "The model is ready, but this browser could not save a project snapshot.",
                  );
                }

                try {
                  sessionStorage.setItem(
                    "fsInput",
                    JSON.stringify({
                      location: { city: location.trim() },
                      monthlyUsage: monthlyBill / effectiveTariff,
                      tariffRate: effectiveTariff,
                    }),
                  );
                  sessionStorage.setItem(
                    "fsResult",
                    JSON.stringify({
                      location: { city: location.trim() },
                      recommendedKW: calculationResult.systemSizeKW,
                      annualSavings: calculationResult.annualSavings,
                      annualProduction: calculationResult.annualProduction,
                      annualConsumption: calculationResult.annualConsumption,
                      paybackYears: calculationResult.paybackYears,
                      netCost: calculationResult.installationCost,
                      lifetimeSavings:
                        calculationResult.lifetimeProfit +
                        calculationResult.installationCost,
                    }),
                  );
                } catch {
                  setStorageNotice(
                    "This browser could not retain the cross-tool handoff. Keep your inputs for the next step.",
                  );
                }

                setGeminiText("");
                setIsGeminiLoading(true);

                if (calculationResult.paybackYears === null) {
                  setGeminiText(
                    "This configuration does not currently recover its installed cost after maintenance. Review the tariff, offset, and system assumptions before proceeding.",
                  );
                  setIsGeminiLoading(false);
                  return;
                }

                try {
                  const res = await fetch("/api/gemini-explanation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      location: location.trim(),
                      monthlyBill,
                      tariffPerKWh: effectiveTariff,
                      systemSizeKW: calculationResult.systemSizeKW,
                      paybackYears: calculationResult.paybackYears,
                      investmentLabel,
                    }),
                  });

                  const data = await res.json();
                  if (
                    !res.ok ||
                    typeof data.text !== "string" ||
                    !data.text.trim()
                  )
                    throw new Error("AI explanation unavailable");
                  setGeminiText(data.text);
                } catch {
                  setGeminiText(
                    "Your model is ready. The optional AI explanation is unavailable right now; the calculations and saved snapshot are unaffected.",
                  );
                } finally {
                  setIsGeminiLoading(false);
                }
              }}
              disabled={isGeminiLoading}
              className="studio-button studio-button-primary feasibility-submit"
            >
              <Zap size={17} aria-hidden="true" />
              {isGeminiLoading
                ? "Building your estimate..."
                : "Build feasibility estimate"}
            </button>

            {hasCalculated && (
              <div className="feasibility-saved-note">
                <ShieldCheck size={18} aria-hidden="true" />
                <div>
                  <strong>A starting point, not a sign-off.</strong>
                  <p>
                    Review the final quote, policy eligibility and site design
                    with a qualified professional.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Image as the card */}
        <div className="lg:col-span-3 rounded-xl flex flex-col overflow-hidden">
          {!hasCalculated ? (
            <div className="feasibility-empty">
              <p className="studio-eyebrow">A LITTLE CONTEXT GOES A LONG WAY</p>
              <div>
                <SolarRoof dark />
              </div>
              <h2>Your first insight is waiting.</h2>
              <p>
                Add your location, monthly bill and tariff to see the starting
                picture. The roof illustration is conceptual, not a proposed
                design.
              </p>
              <span>
                <ShieldCheck size={15} aria-hidden="true" />
                No invented results. Your inputs come first.
              </span>
            </div>
          ) : (
            <div
              className="feasibility-results h-full rounded-xl bg-[#0A0F0F]/80 backdrop-blur-xl
                border border-[#1E2A2A]
                p-8 overflow-y-auto space-y-8"
            >
              {/* TOP SUMMARY */}
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-400">
                  Modeled monthly savings
                </p>
                <h2 className="text-4xl font-bold text-[#7EE081] mt-1">
                  ₹
                  {results
                    ? Math.round(results.annualSavings / 12).toLocaleString()
                    : "--"}
                </h2>
              </div>

              {/* METRICS GRID */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Number of Panels */}
                <MetricCard
                  title="Solar Panels"
                  value={results ? `${results.numberOfPanels} Panels` : "--"}
                  highlight
                />

                {/* System Size */}
                <MetricCard
                  title="System Size"
                  value={
                    results ? `${results.systemSizeKW.toFixed(1)} kW` : "--"
                  }
                />

                {/* Installation Cost */}
                <MetricCard
                  title="Installation Cost"
                  value={
                    results
                      ? `₹${Math.round(results.installationCost).toLocaleString()}`
                      : "--"
                  }
                />

                {/* Annual Savings */}
                <MetricCard
                  title="Annual Savings"
                  value={
                    results
                      ? `₹${Math.round(results.annualSavings).toLocaleString()}`
                      : "--"
                  }
                  highlight
                />

                {/* Payback Period */}
                <MetricCard
                  title="Payback Period"
                  value={
                    results
                      ? results.paybackYears === null
                        ? "Not recoverable"
                        : `${results.paybackYears.toFixed(1)} yrs`
                      : "--"
                  }
                />

                {/* 25 Year Profit */}
                <MetricCard
                  title="25 Year Profit"
                  value={
                    results
                      ? `₹${Math.round(results.lifetimeProfit).toLocaleString()}`
                      : "--"
                  }
                />
              </div>

              {/* FEASIBILITY SCORE */}
              <div>
                <p className="text-sm text-[#F3F4F4]/70 mb-2">
                  Feasibility signal
                </p>
                <div className="w-full h-3 rounded-full bg-[#1D546D]/40">
                  <div
                    className="h-3 rounded-full bg-[#7EE081]"
                    style={{
                      width: results
                        ? `${results.feasibilityScore * 10}%`
                        : "0%",
                    }}
                  />
                </div>
                <p className="text-xs text-[#F3F4F4]/60 mt-1">
                  Model signal:{" "}
                  {results ? results.feasibilityScore.toFixed(1) : "--"} / 10 ·
                  Use this as a comparison aid, not an approval.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <section
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  aria-labelledby="assumptions-heading"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/75">
                    Model assumptions
                  </p>
                  <h3
                    id="assumptions-heading"
                    className="mt-2 text-base font-semibold text-white"
                  >
                    What shaped this estimate
                  </h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-white/45">Blended tariff</dt>
                      <dd className="font-medium text-white">
                        {modeledInput
                          ? `₹${modeledInput.tariffPerKWh}/kWh`
                          : "Rebuild to confirm"}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-white/45">Bill offset target</dt>
                      <dd className="font-medium text-white">80%</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-white/45">Solar yield baseline</dt>
                      <dd className="font-medium text-white">4.5 kWh/kW/day</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-white/45">Model horizon</dt>
                      <dd className="font-medium text-white">25 years</dd>
                    </div>
                  </dl>
                </section>

                <section
                  className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-5"
                  aria-labelledby="review-heading"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-amber-200/75">
                    Before you commit
                  </p>
                  <h3
                    id="review-heading"
                    className="mt-2 text-base font-semibold text-white"
                  >
                    Three checks still matter
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/60">
                    <li className="flex gap-3">
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-300"
                        aria-hidden="true"
                      />
                      Confirm the effective tariff and fixed charges on your
                      bill.
                    </li>
                    <li className="flex gap-3">
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-300"
                        aria-hidden="true"
                      />
                      Ask an installer to validate roof area, structure, and
                      shadowing.
                    </li>
                    <li className="flex gap-3">
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-300"
                        aria-hidden="true"
                      />
                      Verify current subsidy and net-metering rules with your
                      DISCOM.
                    </li>
                  </ul>
                </section>
              </div>

              {/* EXECUTIVE SUMMARY */}
              <div className="rounded-2xl bg-[#1D546D]/30 border border-white/10 p-6">
                <p className="text-xs uppercase tracking-wider text-[#7EE081] mb-2">
                  Executive Summary
                </p>
                <p className="text-sm text-[#F3F4F4]/80 whitespace-pre-line leading-relaxed">
                  {isModelStale
                    ? "These results belong to your last built estimate. Rebuild with the updated inputs before using this model."
                    : isGeminiLoading
                      ? "Analyzing your solar feasibility..."
                      : geminiText}
                </p>
              </div>

              <button
                onClick={() => {
                  if (!results || isModelStale) return;

                  router.push(
                    `/service2?kw=${results.systemSizeKW}&tariff=${tariffPerKWh}&sun=4.5&bill=${monthlyBill}&location=${encodeURIComponent(location)}`,
                  );
                }}
                disabled={isModelStale}
                className="studio-button studio-button-primary feasibility-outlook"
              >
                {isModelStale
                  ? "Rebuild the estimate to continue"
                  : "Review 25-year outlook"}
                <ArrowUpRight size={17} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
