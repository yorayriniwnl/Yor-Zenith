export const workspaceDestinations = [
  {
    href: "/dashboard",
    label: "Overview",
    shortLabel: "Home",
    description: "Your projects and next steps",
    key: "overview",
  },
  {
    href: "/service1",
    label: "Feasibility",
    shortLabel: "Model",
    description: "Bill, system sizing and payback",
    key: "feasibility",
  },
  {
    href: "/service2",
    label: "Investment model",
    shortLabel: "Returns",
    description: "Cash flow and 25-year scenarios",
    key: "investment",
  },
  {
    href: "/service3",
    label: "Policy & subsidies",
    shortLabel: "Policy",
    description: "Estimates and eligibility checks",
    key: "policy",
  },
  {
    href: "/service4",
    label: "Rooftop assessment",
    shortLabel: "Roof",
    description: "A preliminary visual site study",
    key: "rooftop",
  },
  {
    href: "/service5",
    label: "Energy scenarios",
    shortLabel: "Energy",
    description: "Solar, storage and grid simulation",
    key: "energy",
  },
] as const;

export function isWorkspacePath(pathname: string) {
  return workspaceDestinations.some(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  );
}

export function workspaceEntryHref(destination = "/dashboard") {
  return `/login?next=${encodeURIComponent(destination)}`;
}

export function safeWorkspaceDestination(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(value)
  ) {
    return "/dashboard";
  }

  try {
    const url = new URL(value, "https://zenith.invalid");
    if (
      url.origin !== "https://zenith.invalid" ||
      !isWorkspacePath(url.pathname)
    )
      return "/dashboard";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}
