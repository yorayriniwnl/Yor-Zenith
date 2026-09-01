import type { LumenInput, LumenOutput } from "@/lib/lumen/types";

function assertNonNegativeNumber(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid ${label}`);
  }
}

function round(value: number, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function optimizeEnergy(input: LumenInput): LumenOutput {
  const solarA = input.solar_A;
  const demandA = input.demand_A;
  const demandB = input.demand_B;
  const demandC = input.demand_C;
  const batteryB = input.battery_B;
  const gridPrice = input.grid_price;
  const p2pPrice = input.p2p_price;

  assertNonNegativeNumber(solarA, "solar_A");
  assertNonNegativeNumber(demandA, "demand_A");
  assertNonNegativeNumber(demandB, "demand_B");
  assertNonNegativeNumber(demandC, "demand_C");
  assertNonNegativeNumber(batteryB, "battery_B");
  assertNonNegativeNumber(gridPrice, "grid_price");
  assertNonNegativeNumber(p2pPrice, "p2p_price");

  const gridToA = Math.max(demandA - solarA, 0);
  let solarSurplus = Math.max(solarA - demandA, 0);

  const batteryUsedLocally = Math.min(batteryB, demandB);
  let batterySurplus = Math.max(batteryB - batteryUsedLocally, 0);
  let remainingDemandB = demandB - batteryUsedLocally;
  let remainingDemandC = demandC;

  let aToB = 0;
  let aToC = 0;
  let bToC = 0;

  if (p2pPrice < gridPrice) {
    aToB = Math.min(solarSurplus, remainingDemandB);
    solarSurplus -= aToB;
    remainingDemandB -= aToB;

    aToC = Math.min(solarSurplus, remainingDemandC);
    solarSurplus -= aToC;
    remainingDemandC -= aToC;

    bToC = Math.min(batterySurplus, remainingDemandC);
    batterySurplus -= bToC;
    remainingDemandC -= bToC;
  }

  const gridToB = remainingDemandB;
  const gridToC = remainingDemandC;
  const totalCost =
    gridPrice * (gridToA + gridToB + gridToC) +
    p2pPrice * (aToB + aToC + bToC);
  const baselineCost = (demandA + demandB + demandC) * gridPrice;
  const savings = baselineCost - totalCost;
  const efficiencyGainPercent =
    baselineCost > 0 ? (savings / baselineCost) * 100 : 0;

  return {
    A_to_B: round(aToB),
    A_to_C: round(aToC),
    B_to_C: round(bToC),
    grid_to_A: round(gridToA),
    grid_to_B: round(gridToB),
    grid_to_C: round(gridToC),
    total_cost: round(totalCost),
    baseline_cost: round(baselineCost),
    savings: round(savings),
    efficiency_gain_percent: round(efficiencyGainPercent, 2),
  };
}
