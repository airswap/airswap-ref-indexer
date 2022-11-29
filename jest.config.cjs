/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  moduleFileExtensions: ["ts", "js", "cjs", "mjs"],
  transformIgnorePatterns:["node_modules/(?!@airswap/.*)"],     //   '//node_modules'
  testPathIgnorePatterns: ["node_modules", "dist"],
  collectCoverageFrom: [
      "**/src/**/*.{js,ts}",
      "!**/src/indexers/index.ts", //  fix bug with coverage
      "!**/node_modules/**",
      "!**/src/types/**",
      "!**/dist/**",
  ],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  }
};
