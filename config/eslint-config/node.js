import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * ESLint configuration for Node.js 20 environment
 * @type {import("eslint").Linter.Config}
 */
const config = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: tsParser,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    ...js.configs.recommended,
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["turbo", "only-warn", "@typescript-eslint"],
  rules: {
    "turbo/no-undeclared-env-vars": "warn",
    "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1, maxBOF: 0 }],
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      },
    },
  ],
  ignorePatterns: ["dist/**"],
};

export default config;
