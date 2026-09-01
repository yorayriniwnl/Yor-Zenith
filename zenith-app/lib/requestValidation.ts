import type { LumenInput } from "@/lib/lumen/types";

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
}

function boundedNumber(
  value: unknown,
  label: string,
  min = 0,
  max = 1_000_000_000
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(`${label} must be a number between ${min} and ${max}`);
  }
  return value;
}

function boundedText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maxLength) {
    throw new Error(`${label} is invalid`);
  }
  return value.trim();
}

export function parseLumenInput(value: unknown): LumenInput {
  const body = asRecord(value);
  if (!body) throw new Error("Request body must be an object");

  return {
    solar_A: boundedNumber(body.solar_A, "solar_A", 0, 1_000_000),
    demand_A: boundedNumber(body.demand_A, "demand_A", 0, 1_000_000),
    demand_B: boundedNumber(body.demand_B, "demand_B", 0, 1_000_000),
    demand_C: boundedNumber(body.demand_C, "demand_C", 0, 1_000_000),
    battery_B: boundedNumber(body.battery_B, "battery_B", 0, 1_000_000),
    grid_price: boundedNumber(body.grid_price, "grid_price", 0, 100_000),
    p2p_price: boundedNumber(body.p2p_price, "p2p_price", 0, 100_000),
  };
}

export type FeasibilityRequest = {
  location: string;
  monthlyBill: number;
  systemSizeKW: number;
  paybackYears: number;
};

export function parseFeasibilityRequest(value: unknown): FeasibilityRequest {
  const body = asRecord(value);
  if (!body) throw new Error("Request body must be an object");

  return {
    location: boundedText(body.location, "location", 120),
    monthlyBill: boundedNumber(body.monthlyBill, "monthlyBill", 0.01, 10_000_000),
    systemSizeKW: boundedNumber(body.systemSizeKW, "systemSizeKW", 0.01, 100_000),
    paybackYears: boundedNumber(body.paybackYears, "paybackYears", 0, 100),
  };
}

export type SubsidyExplanationRequest = Omit<FeasibilityRequest, "monthlyBill"> & {
  monthlyBill: number | null;
  centralSubsidy: number;
  stateSubsidy: number;
  totalSubsidy: number;
  netSystemCost: number;
  subsidyCoverage: number;
};

export function parseSubsidyExplanationRequest(
  value: unknown
): SubsidyExplanationRequest {
  const body = asRecord(value);
  if (!body) throw new Error("Request body must be an object");

  const monthlyBill =
    body.monthlyBill === undefined || body.monthlyBill === null
      ? null
      : boundedNumber(body.monthlyBill, "monthlyBill", 0.01, 10_000_000);

  return {
    location: boundedText(body.location, "location", 120),
    monthlyBill,
    systemSizeKW: boundedNumber(body.systemSizeKW, "systemSizeKW", 0.01, 100_000),
    paybackYears: boundedNumber(body.paybackYears, "paybackYears", 0, 100),
    centralSubsidy: boundedNumber(body.centralSubsidy, "centralSubsidy", 0, 100_000_000),
    stateSubsidy: boundedNumber(body.stateSubsidy, "stateSubsidy", 0, 100_000_000),
    totalSubsidy: boundedNumber(body.totalSubsidy, "totalSubsidy", 0, 100_000_000),
    netSystemCost: boundedNumber(body.netSystemCost, "netSystemCost", 0, 100_000_000),
    subsidyCoverage: boundedNumber(body.subsidyCoverage, "subsidyCoverage", 0, 100),
  };
}

export type RooftopFinanceRequest = {
  siteName: string;
  systemSizeKW: number;
  batteryKWh: number;
  irr: number;
  paybackYears: number;
  equityRequired: number;
  npv: number;
};

export function parseRooftopFinanceRequest(value: unknown): RooftopFinanceRequest {
  const body = asRecord(value);
  if (!body) throw new Error("Request body must be an object");

  return {
    siteName: boundedText(body.siteName, "siteName", 160),
    systemSizeKW: boundedNumber(body.systemSizeKW, "systemSizeKW", 0.01, 100_000),
    batteryKWh: boundedNumber(body.batteryKWh, "batteryKWh", 0, 1_000_000),
    irr: boundedNumber(body.irr, "irr", -100, 10_000),
    paybackYears: boundedNumber(body.paybackYears, "paybackYears", 0, 100),
    equityRequired: boundedNumber(body.equityRequired, "equityRequired", 0, 10_000_000_000),
    npv: boundedNumber(body.npv, "npv", -10_000_000_000, 10_000_000_000),
  };
}

export type RooftopVisionRequest = {
  image: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

export function parseRooftopVisionRequest(value: unknown): RooftopVisionRequest {
  const body = asRecord(value);
  if (!body) throw new Error("Request body must be an object");

  const image = boundedText(body.image, "image", 8_000_000);
  if (!/^[A-Za-z0-9+/=_-]+$/.test(image)) throw new Error("image must be base64 data");

  const mimeType = body.mimeType ?? "image/jpeg";
  if (mimeType !== "image/jpeg" && mimeType !== "image/png" && mimeType !== "image/webp") {
    throw new Error("Unsupported image type");
  }

  return { image, mimeType };
}

export function parseStructuredJson(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const parsed: unknown = JSON.parse(cleaned);
  const record = asRecord(parsed);
  if (!record) throw new Error("AI response must be a JSON object");
  return record;
}

export function parseRooftopVisionResult(value: RecordValue) {
  const roofAreaSqFt = boundedNumber(value.roofAreaSqFt, "roofAreaSqFt", 0, 1_000_000);
  const recommendedKW = boundedNumber(value.recommendedKW, "recommendedKW", 0, 100_000);
  const obstacles = Array.isArray(value.obstacles)
    ? value.obstacles
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  return { roofAreaSqFt, recommendedKW, obstacles };
}
