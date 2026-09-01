// Zenith — Service 1 solar calculations

export type SolarCalculationInput = {
  monthlyBill: number;
  tariffPerKWh: number;
  offsetFactor: number;
  feasibilityScore: number;
};

export type SolarCalculationResult = {
  systemSizeKW: number;
  numberOfPanels: number;
  installationCost: number;
  annualSavings: number;
  paybackYears: number | null;
  lifetimeProfit: number;
  feasibilityScore: number;
  annualProduction: number;
  annualConsumption: number;
};

function assertValidInput(input: SolarCalculationInput) {
  if (
    !Number.isFinite(input.monthlyBill) ||
    input.monthlyBill <= 0 ||
    input.monthlyBill > 10_000_000
  ) {
    throw new Error("Monthly bill must be between ₹0 and ₹10,000,000");
  }
  if (!Number.isFinite(input.tariffPerKWh) || input.tariffPerKWh <= 0) {
    throw new Error("Tariff must be greater than zero");
  }
  if (input.tariffPerKWh > 1_000) {
    throw new Error("Tariff must be no more than ₹1,000 per kWh");
  }
  if (!Number.isFinite(input.offsetFactor) || input.offsetFactor <= 0 || input.offsetFactor > 1) {
    throw new Error("Offset factor must be between 0 and 1");
  }
  if (
    !Number.isFinite(input.feasibilityScore) ||
    input.feasibilityScore < 0 ||
    input.feasibilityScore > 10
  ) {
    throw new Error("Feasibility score must be between 0 and 10");
  }
}

export function calculateSolarBenefits(
  input: SolarCalculationInput
): SolarCalculationResult {
  assertValidInput(input);

  const {
    monthlyBill,
    tariffPerKWh,
    offsetFactor,
    feasibilityScore,
  } = input;

  /* -------------------------
     1. Electricity usage
  -------------------------- */
  const monthlyKWh = monthlyBill / tariffPerKWh;
  const dailyKWh = monthlyKWh / 30;

  /* -------------------------
     2. Production efficiency
     (realistic lower bound)
  -------------------------- */
  const rawEfficiency = feasibilityScore / 10;
  const efficiency = Math.max(rawEfficiency, 0.7);

  /* -------------------------
     3. Solar generation
  -------------------------- */
  const IDEAL_PRODUCTION_PER_KW = 4.5; // India avg (kWh/day)
  const productionPerKW =
    IDEAL_PRODUCTION_PER_KW * efficiency;

  /* -------------------------
     4. System sizing
  -------------------------- */
  const rawSystemSizeKW = dailyKWh / productionPerKW;
  const bufferedSystemSizeKW =
    rawSystemSizeKW * 1.15;

  /* -------------------------
     5. Panel sizing
  -------------------------- */
  const PANEL_SIZE_KW = 0.55;
  const numberOfPanels = Math.ceil(
    bufferedSystemSizeKW / PANEL_SIZE_KW
  );
  const systemSizeKW = numberOfPanels * PANEL_SIZE_KW;
  if (systemSizeKW > 1_000) {
    throw new Error("This estimate exceeds 1 MW. Use a commercial project model instead.");
  }

  /* -------------------------
     6. Tiered installation cost
     (economy of scale)
  -------------------------- */
  let costPerKW = 65000;
  if (systemSizeKW > 2) costPerKW = 60000;
  if (systemSizeKW > 5) costPerKW = 52000;

  const FIXED_INSTALLATION_COST = 25000;

  const installationCost =
    systemSizeKW * costPerKW +
    FIXED_INSTALLATION_COST;

  /* -------------------------
     7. Annual savings
  -------------------------- */
  const annualConsumption = monthlyKWh * 12;
  const annualGeneration = systemSizeKW * productionPerKW * 365;
  const billOffsetKWh = Math.min(annualConsumption * offsetFactor, annualGeneration);
  const grossAnnualSavings = billOffsetKWh * tariffPerKWh;

  const annualMaintenanceCost =
    installationCost * 0.01;

  const netAnnualSavings =
    grossAnnualSavings - annualMaintenanceCost;

  /* -------------------------
     8. Payback period
  -------------------------- */
  const paybackYears =
    netAnnualSavings > 0 ? installationCost / netAnnualSavings : null;

  /* -------------------------
     9. Lifetime profit
     (average degradation)
  -------------------------- */
  const SYSTEM_LIFETIME_YEARS = 25;
  const ANNUAL_DEGRADATION_RATE = 0.007;

  let lifetimeSavings = 0;
  for (let year = 0; year < SYSTEM_LIFETIME_YEARS; year += 1) {
    lifetimeSavings +=
      netAnnualSavings * Math.pow(1 - ANNUAL_DEGRADATION_RATE, year);
  }

  const lifetimeProfit =
    lifetimeSavings - installationCost;

  return {
    systemSizeKW,
    numberOfPanels,
    installationCost: Math.round(installationCost),
    annualSavings: Math.round(netAnnualSavings),
    paybackYears,
    lifetimeProfit: Math.round(lifetimeProfit),
    feasibilityScore,
    annualProduction: annualGeneration,
    annualConsumption,
  };
}
