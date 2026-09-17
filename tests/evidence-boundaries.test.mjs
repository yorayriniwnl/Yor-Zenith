import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const appRoot = path.join(repoRoot, "zenith-app");

function sourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === ".next") return [];
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return /\.(?:[cm]?[jt]sx?)$/.test(entry.name) ? [fullPath] : [];
  });
}

test("browser-visible source never references public API-key environment variables", () => {
  const violations = [];
  for (const file of sourceFiles(appRoot)) {
    const source = fs.readFileSync(file, "utf8");
    if (/NEXT_PUBLIC_[A-Z0-9_]*(?:API_KEY|SECRET|TOKEN)/.test(source)) {
      violations.push(path.relative(repoRoot, file));
    }
  }
  assert.deepEqual(violations, []);
});

test("feasibility UI describes the output as an estimate rather than verified investment advice", () => {
  const service1 = fs.readFileSync(
    path.join(appRoot, "app", "(dashboard)", "service1", "page.tsx"),
    "utf8",
  );
  assert.equal(service1.includes("hyper-accurate"), false);
  assert.equal(service1.includes("investment-grade"), false);
  assert.match(service1, /estimate|scenario|assumption/i);
});
