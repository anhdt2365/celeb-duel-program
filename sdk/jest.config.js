module.exports = {
    "roots": [
      "<rootDir>/src",
      "<rootDir>/tests"
    ],
    "testMatch": [
      "**/__tests__/**/*.+(ts|tsx|js)",
      "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "/tests/test-utils/",
      "/src/fetcher",
      "\\.mock\\.js$"
    ],
    transform: {
      '^.+\\.tsx?$': [
        'ts-jest',
        {tsconfig: 'tests/tsconfig.json'},
      ]
    },
    testTimeout: 30 * 1000
  }
