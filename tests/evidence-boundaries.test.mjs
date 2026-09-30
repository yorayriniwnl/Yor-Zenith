// Security regression contract for browser-visible configuration and demo access.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const appRoot = path.join(repoRoot, "zenith-app");

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === ".next") return [];
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return /\.(?:[cm]?[jt]sx?)$/.test(entry.name) ? [fullPath] : [];
  });
}

test("browser-visible source never references public secret-like environment variables", () => {
  const violations = [];
  for (const file of sourceFiles(appRoot)) {
    const source = fs.readFileSync(file, "utf8");
    if (/NEXT_PUBLIC_[A-Z0-9_]*(?:API_KEY|SECRET|TOKEN)/.test(source)) {
      violations.push(path.relative(repoRoot, file));
    }
  }
  assert.deepEqual(violations, []);
});

test("demo access is explicitly not credential authentication", () => {
  const login = fs.readFileSync(path.join(appRoot, "app", "login", "page.tsx"), "utf8");
  assert.equal(/type=["']password["']|admin@zenith\.com|zenith123/i.test(login), false);
  assert.match(login, /public demonstration|not authentication|demo/i);
});