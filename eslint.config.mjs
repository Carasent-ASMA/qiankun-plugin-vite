import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "es/**",
      "node_modules/**",
      "example/**",
      "src/experimental.index.ts",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.ts", "type/**/*.d.ts", "vite.config.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];