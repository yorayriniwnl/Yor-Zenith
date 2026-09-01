import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

// Use the project's TypeScript compiler so the tests also run on Node 20.
// Each test gets a fresh browser-storage stub, never a real user profile.
function loadSource(relativePath, extraGlobals = {}) {
  const filename = fileURLToPath(new URL(relativePath, import.meta.url));
  const source = readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const exports = {};
  const context = vm.createContext({
    exports,
    module: { exports },
    require: createRequire(filename),
    URL,
    Event,
    crypto: { randomUUID },
    ...extraGlobals,
  });
  new vm.Script(compiled.outputText, { filename }).runInContext(context);
  return context.module.exports;
}

function makeStorage() {
  const items = new Map();
  const events = [];
  return {
    items,
    events,
    window: {
      localStorage: {
        getItem: (key) => items.get(key) ?? null,
        setItem: (key, value) => items.set(key, value),
        removeItem: (key) => items.delete(key),
      },
      dispatchEvent: (event) => {
        events.push(event.type);
        return true;
      },
    },
  };
}

const project = (overrides = {}) => ({
  id: "studio-test-1",
  name: "Test roof",
  location: "Test city",
  monthlyBill: 4000,
  tariffPerKWh: 8,
  systemSizeKW: 5.5,
  paybackYears: 8.8,
  feasibilityScore: 8,
  status: "modeled",
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  ...overrides,
});

test("the public preview has stable, finite outputs throughout its slider range", () => {
  const { calculateSolarBenefits } = loadSource("../lib/solarCalculations.ts");
  let previousSize = 0;
  for (let monthlyBill = 1000; monthlyBill <= 12000; monthlyBill += 250) {
    const result = calculateSolarBenefits({
      monthlyBill,
      tariffPerKWh: 8,
      offsetFactor: 0.8,
      feasibilityScore: 8,
    });
    assert.ok(result.systemSizeKW >= previousSize);
    assert.ok(Number.isFinite(result.annualSavings));
    assert.ok(result.annualSavings > 0);
    assert.ok(Number.isFinite(result.paybackYears) && result.paybackYears > 0);
    assert.ok(result.annualProduction > 0);
    previousSize = result.systemSizeKW;
  }
  const baseline = calculateSolarBenefits({
    monthlyBill: 4000,
    tariffPerKWh: 8,
    offsetFactor: 0.8,
    feasibilityScore: 8,
  });
  assert.equal(baseline.systemSizeKW, 5.5);
  assert.equal(baseline.installationCost, 311000);
  assert.equal(baseline.annualSavings, 35290);
  assert.equal(baseline.paybackYears.toFixed(1), "8.8");
});

test("invalid model inputs fail explicitly rather than producing misleading results", () => {
  const { calculateSolarBenefits } = loadSource("../lib/solarCalculations.ts");
  for (const monthlyBill of [0, -1, NaN, Infinity, 10000001]) {
    assert.throws(() =>
      calculateSolarBenefits({
        monthlyBill,
        tariffPerKWh: 8,
        offsetFactor: 0.8,
        feasibilityScore: 8,
      }),
    );
  }
});

test("workspace entry retains the preview bill and accepts only internal workspace routes", () => {
  const { safeWorkspaceDestination, workspaceEntryHref, isWorkspacePath } =
    loadSource("../lib/workspaceNavigation.ts");
  const target = "/service1?bill=8000";
  assert.equal(safeWorkspaceDestination(target), target);
  assert.equal(
    workspaceEntryHref(target),
    "/login?next=%2Fservice1%3Fbill%3D8000",
  );
  assert.equal(isWorkspacePath("/dashboard"), true);
  assert.equal(isWorkspacePath("/dashboard-fake"), false);
  for (const untrusted of [
    undefined,
    null,
    [target],
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/service1/../../login",
    "/login",
    "/service1\n",
    "/%2fexample.com",
  ]) {
    assert.equal(safeWorkspaceDestination(untrusted), "/dashboard");
  }
});

test("investment handoff preserves fractional rooftop sizes as a distinct scenario", () => {
  const { readInvestmentHandoff, MIN_INVESTMENT_KW, MAX_INVESTMENT_KW } =
    loadSource("../lib/investmentHandoff.ts");
  for (const kw of [0.55, 5.5, 11.55, 1000, 6000]) {
    const linked = readInvestmentHandoff(
      new URLSearchParams({
        kw: String(kw),
        tariff: "8.25",
        location: "Odisha",
      }),
    );
    assert.equal(linked.id, "linked-project");
    assert.equal(linked.type, "Feasibility inputs");
    assert.equal(linked.recommendedKw, kw);
    assert.equal(linked.baseRate, 8.25);
    assert.equal(linked.recommendedStorage, 0);
    assert.ok(kw >= MIN_INVESTMENT_KW && kw <= MAX_INVESTMENT_KW);
  }
});

test("investment handoff rejects invalid sizes and tariffs", () => {
  const { readInvestmentHandoff } = loadSource("../lib/investmentHandoff.ts");
  for (const kw of ["", "0", "-5", "NaN", "Infinity", "100001"]) {
    assert.equal(
      readInvestmentHandoff(new URLSearchParams({ kw, tariff: "8" })),
      null,
    );
  }
  for (const tariff of ["0", "0.001", "-1", "NaN", "Infinity", "1001"]) {
    assert.equal(
      readInvestmentHandoff(new URLSearchParams({ kw: "5.5", tariff })),
      null,
    );
  }
});

test("snapshot backup and restore round-trip data including nullable payback", () => {
  const storage = makeStorage();
  const api = loadSource("../lib/zenithProjects.ts", {
    window: storage.window,
  });
  const saved = api.upsertZenithProject(project({ paybackYears: null }));
  assert.ok(saved.id);
  const backup = JSON.parse(api.createZenithProjectsBackup());
  assert.equal(backup.version, 1);
  assert.equal(backup.projects[0].paybackYears, null);
  assert.equal(api.clearZenithProjects(), true);
  assert.equal(api.readZenithProjects().length, 0);
  assert.equal(api.restoreZenithProjectsBackup(backup).imported, 1);
  assert.equal(api.readZenithProjects()[0].name, "Test roof");
  assert.ok(storage.events.includes(api.ZENITH_PROJECTS_CHANGED_EVENT));
});

test("malformed backups never erase the existing project library", () => {
  const storage = makeStorage();
  const api = loadSource("../lib/zenithProjects.ts", {
    window: storage.window,
  });
  api.upsertZenithProject(project());
  const before = storage.items.get(api.ZENITH_PROJECTS_STORAGE_KEY);
  for (const backup of [
    null,
    [],
    { version: 2, projects: [] },
    { version: 1, projects: [{ id: "broken" }] },
  ]) {
    assert.throws(() => api.restoreZenithProjectsBackup(backup));
    assert.equal(storage.items.get(api.ZENITH_PROJECTS_STORAGE_KEY), before);
  }
});

test("unavailable browser storage does not crash workspace read or clear", () => {
  const blockedWindow = { dispatchEvent: () => true };
  Object.defineProperty(blockedWindow, "localStorage", {
    get: () => {
      throw new Error("Storage is blocked");
    },
  });
  const api = loadSource("../lib/zenithProjects.ts", { window: blockedWindow });
  assert.equal(api.readZenithProjects().length, 0);
  assert.equal(api.clearZenithProjects(), false);
  assert.equal(api.upsertZenithProject(project()), null);
  assert.throws(
    () =>
      api.restoreZenithProjectsBackup({ version: 1, projects: [project()] }),
    /could not save/,
  );
});

test("clearing snapshots leaves other tool drafts untouched", () => {
  const storage = makeStorage();
  storage.items.set("service1Data", "test-only-draft");
  const api = loadSource("../lib/zenithProjects.ts", {
    window: storage.window,
  });
  api.upsertZenithProject(project());
  api.clearZenithProjects();
  assert.equal(storage.items.get("service1Data"), "test-only-draft");
});

test("restore cannot overwrite a newer local project with an older backup", () => {
  const storage = makeStorage();
  const api = loadSource("../lib/zenithProjects.ts", {
    window: storage.window,
  });
  const current = project({
    name: "Newer local version",
    updatedAt: "2026-08-30T00:00:00.000Z",
  });
  storage.items.set(api.ZENITH_PROJECTS_STORAGE_KEY, JSON.stringify([current]));
  const result = api.restoreZenithProjectsBackup({
    version: 1,
    projects: [project()],
  });
  assert.equal(result.imported, 0);
  assert.equal(result.skipped, 1);
  assert.equal(api.readZenithProjects()[0].name, "Newer local version");
});

test("restore deduplicates incoming IDs and keeps the latest version", () => {
  const storage = makeStorage();
  const api = loadSource("../lib/zenithProjects.ts", {
    window: storage.window,
  });
  const result = api.restoreZenithProjectsBackup({
    version: 1,
    projects: [
      project(),
      project({
        name: "Newer backup version",
        updatedAt: "2026-08-30T00:00:00.000Z",
      }),
    ],
  });
  assert.equal(result.imported, 1);
  assert.equal(result.skipped, 1);
  assert.equal(api.readZenithProjects().length, 1);
  assert.equal(api.readZenithProjects()[0].name, "Newer backup version");
});

test("restoring at capacity does not silently evict an existing project", () => {
  const storage = makeStorage();
  const api = loadSource("../lib/zenithProjects.ts", {
    window: storage.window,
  });
  const existing = Array.from({ length: 12 }, (_, index) =>
    project({ id: `existing-${index}` }),
  );
  storage.items.set(api.ZENITH_PROJECTS_STORAGE_KEY, JSON.stringify(existing));
  const result = api.restoreZenithProjectsBackup({
    version: 1,
    projects: [
      project({ id: "new-incoming", updatedAt: "2026-08-31T00:00:00.000Z" }),
    ],
  });
  assert.equal(result.imported, 0);
  assert.equal(api.readZenithProjects().length, 12);
  assert.ok(
    api.readZenithProjects().every((item) => item.id.startsWith("existing-")),
  );
});
