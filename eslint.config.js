import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import next from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // ESLint's flat config does not read .gitignore, so every generated or
  // vendored directory has to be listed here. Without this, `eslint .` walks
  // the build output and the stray `./~/.npm-cache` tree and takes ~10 minutes.
  {
    ignores: [
      ".next",
      "out",
      "next-env.d.ts",
      "public",
      "docs",
      "supabase/**/*.js",
      "src/integrations/supabase/types.ts",
      // Left over from the pre-Next stacks and a mis-quoted `npm --cache ~/…`.
      ".output",
      ".tanstack",
      ".wrangler",
      ".lovable",
      "~",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      // Server Components, route handlers and the build scripts all run in Node,
      // so both global sets have to be available.
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      // The codebase already carries `@next/next/*` and `jsx-a11y/*` disable
      // comments; without these plugins registered those rules never ran and
      // each comment was itself reported as an unknown-rule error.
      "@next/next": next,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      // Deliberate autoFocus (the gallery lightbox) is opted out inline; this
      // keeps the rule on so new occurrences still get flagged.
      "jsx-a11y/no-autofocus": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  eslintPluginPrettier,
);
