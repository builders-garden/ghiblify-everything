module.exports = {
  extends: ["next", "prettier"],
  plugins: [
    "@typescript-eslint",
    "ban",
    "import",
    "no-restricted-imports",
    "react-hooks",
    "react",
    "simple-import-sort",
  ],
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-var-requires": "off",
    "@next/next/no-html-link-for-pages": "off",
    "@next/next/no-page-custom-font": "off",
    eqeqeq: "error",
    "import/no-default-export": "error",
    "no-duplicate-imports": "error",
    "no-implicit-globals": "error",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react/jsx-key": "off",
    "react/no-unescaped-entities": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "lodash",
            message: "Import [module] from lodash/[module] instead",
          },
        ],
      },
    ],
    "valid-typeof": "error",
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
};
