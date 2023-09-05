export default {
  preset: "ts-jest",
  testEnvironment: "node",
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
    "dist/",
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["<rootDir>/src/**"],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 80,
      functions: 70,
      lines: 60,
    },
  },
};
