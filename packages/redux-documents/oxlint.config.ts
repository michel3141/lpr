import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
    suspicious: "warn",
    nursery: "error",
  },
  globals: {},
  env: {
    commonjs: true,
    node: true,
    browser: true,
  },
  rules: {
    "no-unused-vars": [
      "error",
      {
        args: "none",
        varsIgnorePattern: "^(_|logger)$",
      },
    ],
  },
});
