import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // ignore build output folder
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // allow unused variables starting with uppercase or underscore
      "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z_]" }],
      // prevent fast refresh warnings when exporting helper functions alongside components
      "react-refresh/only-export-components": "off",
    },
  },
]);
