import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import queryPlugin from "@tanstack/eslint-plugin-query";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  ...queryPlugin.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
