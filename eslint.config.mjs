import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "drizzle/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Allow unused vars prefixed with _ (common pattern for intentionally unused params)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Permit explicit `any` but warn — too many to fix at once
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow empty functions (event handler stubs, etc.)
      "@typescript-eslint/no-empty-function": "off",
      // Allow require() for dynamic imports in config files
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
