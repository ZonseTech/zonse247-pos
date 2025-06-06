import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // { ignores: ["dist", "cypress.config.ts"] },
  {
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/recommended",
      "plugin:import/electron",
      "plugin:import/typescript",
    ],
    env: {
      browser: true,
      es6: true,
      node: true,
    },
    plugins: {
      // "react-hooks": reactHooks,
      // "react-refresh": reactRefresh,
    },
    rules: {
      // ...reactHooks.configs.recommended.rules,
      // "react-refresh/only-export-components": [
      //   "warn",
      //   { allowConstantExport: true },
      // ],
      "@typescript-eslint/no-explicit-any": "off",
      "no-mixed-spaces-and-tabs": "off",
      // "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      // "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
  }
);
