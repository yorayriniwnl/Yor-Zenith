export const MIN_INVESTMENT_KW = 0.05;
export const MAX_INVESTMENT_KW = 100_000;

export function readInvestmentHandoff(query: Pick<URLSearchParams, "get">) {
  const kw = Number(query.get("kw"));
  const tariff = Number(query.get("tariff") ?? 14.5);
  if (
    !Number.isFinite(kw) ||
    kw < MIN_INVESTMENT_KW ||
    kw > MAX_INVESTMENT_KW ||
    !Number.isFinite(tariff) ||
    tariff < 0.01 ||
    tariff > 1_000
  ) {
    return null;
  }

  const location = query.get("location")?.trim().slice(0, 120);
  return {
    id: "linked-project",
    name: location ? `${location} Solar Project` : "Linked Solar Project",
    type: "Feasibility inputs",
    baseRate: tariff,
    recommendedKw: kw,
    recommendedStorage: 0,
  };
}
