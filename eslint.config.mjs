import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "tmp/**",
    "scripts/**",
    "node_modules/**",
    "lib/generated/**",
    "prisma/**",
    "next-env.d.ts",
    "create-roles.ts",
    "truncateData.ts",
    "query.js",
  ]),
  {
    rules: {
      // Legacy codebase: keep lint runnable without a full any/hooks rewrite.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "prefer-const": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
])

export default eslintConfig
