import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * ESLint — open since 0.1 of the queue, closed here.
 *
 * `eslint-config-next` 16 ships flat configs directly, so they are imported
 * rather than wrapped in `FlatCompat`. The compat shim throws a circular-JSON
 * error against this version — it exists to load legacy `.eslintrc` shareable
 * configs, and these are not that.
 *
 * The value on this project is narrow but real: it catches the class of
 * mistake that typechecks and still breaks — an unused import left after a
 * refactor, a missing hook dependency, an `<img>` where `next/image` was meant.
 *
 * Generated and vendored output is ignored: `.next` is build product, and
 * `lib/supabase/database.types.ts` mirrors the database rather than being
 * authored.
 */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "lib/supabase/database.types.ts",
    ],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      /*
       * Unused variables are an error, not a warning. This codebase has
       * already shipped one dead import after a refactor — the `localFont`
       * left behind when the fonts moved to the root layout — and a warning
       * nobody reads would not have caught it.
       *
       * `_`-prefixed names are the standard escape for a deliberately ignored
       * parameter.
       */
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default config;
