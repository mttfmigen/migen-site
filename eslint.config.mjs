import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Le colis de passation de Claude Design : du JavaScript de prototype, pas
    // notre code. Il se lit comme référence, il ne se lint pas.
    "design_handoff_migen_site/**",
  ]),
]);

export default eslintConfig;
