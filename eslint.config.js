import tsESLint from "@typescript-eslint/eslint-plugin";
import vueParser from "vue-eslint-parser";
import eslintJS from "@eslint/js";
import globals from "globals";

export default [
  // 基础 ESLint 配置
  eslintJS.configs.recommended,

  // TypeScript 配置
  {
    files: ["**/*.ts", "**/*.vue"],
    plugins: {
      "@typescript-eslint": tsESLint,
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        NodeJS: true,
      },
    },
    rules: {
      ...tsESLint.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
];
