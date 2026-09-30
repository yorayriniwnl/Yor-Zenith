import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const imperativeAnimationFiles = [
  "app/(dashboard)/service2/FuturePotentialPage.tsx",
  "app/(dashboard)/service4/RooftopAnimations.tsx",
  "app/(dashboard)/service4/RooftopPage.tsx",
  "app/engine/page.tsx",
  "app/lumen/page.tsx",
  "components/ClientOnly.tsx",
  "components/lumen/BeforeAfterComparison.tsx",
  "components/lumen/EnergyFlowDiagram.tsx",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: imperativeAnimationFiles,
    rules: {
      // These modules intentionally mutate Three.js refs/camera state inside
      // frame loops and use seeded/local visual state outside React rendering.
      // Keep normal correctness lint and exhaustive-deps active.
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
