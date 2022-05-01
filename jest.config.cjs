/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["node_modules", "dist"],
  collectCoverageFrom: ["**/src/**/*.{js,ts}", "!**/node_modules/**", "!**/src/types/**", "!**/dist/**"],
};
