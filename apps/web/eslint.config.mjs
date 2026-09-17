import nextConfig from "eslint-config-next";

const [reactConfig, tsConfig, ...rest] = nextConfig;

export default [
  {
    ...reactConfig,
    rules: {
      ...reactConfig.rules,
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    ...tsConfig,
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
  ...rest,
];
