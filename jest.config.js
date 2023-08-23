export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  modulePathIgnorePatterns: [
    "src/index.tsx",
    "src/react-app-env.d.ts",
    "src/reportWebVitals.ts",
    "src/theme.ts",
    "src/setupTests.ts",
    "src/source.ts",
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["<rootDir>/src/**"],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 30,
      functions: 40,
      lines: 60,
    },
  },
};
