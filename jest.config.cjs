/**  @type {import('@jest/types').Config.ProjectConfig} */
module.exports = {
    preset: "ts-jest",
    moduleFileExtensions: ["ts", "js", "cjs", "mjs"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
        "node_modules/tiny-secp256k1/lib/cjs/.+\\.(js|ts|cjs|mjs)$": "ts-jest",
        "node_modules/uint8array-tools/src/cjs.+\\.(js|ts|cjs|mjs)$": "ts-jest",
    },
    moduleNameMapper: {
        "^uint8array-tools$": "uint8array-tools/src/cjs",
        "^tiny-secp256k1$": "tiny-secp256k1/lib/cjs",
    },
    transformIgnorePatterns: [
        "node_modules/(?!tiny-secp256k1/lib/cjs/.*)",
        "node_modules/(?!uint8array-tools/src/cjs/.*)",
    ],
    testPathIgnorePatterns: ["node_modules", "dist"],
    collectCoverageFrom: [
        "**/src/**/*.{js,ts}",
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
