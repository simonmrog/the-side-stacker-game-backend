// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],

  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
  },

  env: {
    browser: true,
    es2021: true,
  },
};
