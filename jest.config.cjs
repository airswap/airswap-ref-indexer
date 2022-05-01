/**  @type {import('@jest/types').Config.ProjectConfig} */
module.exports = {
  transform: {
    "\\.[jt]sx?$": "ts-jest",
  },
  "globals": {
    "ts-jest": {
      "useESM": true
    }
  },
  moduleNameMapper: {
    "(.+)\\.js": "$1"
  },
  extensionsToTreatAsEsm: [".ts"],
  testPathIgnorePatterns: ["node_modules", "dist"],
  collectCoverageFrom: ["**/src/**/*.{js,ts}", "!**/node_modules/**", "!**/src/types/**", "!**/dist/**"],

};