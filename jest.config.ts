import type {Config} from 'jest';

const config: Config = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFiles: [
        "<rootDir>/tests/jest.storage.setup.ts",
        "<rootDir>/tests/jest.message.setup.ts"
    ],
    moduleNameMapper: {
        "^@browser/(.*)$": "<rootDir>/src/browser/$1",
        "^@cli/(.*)$": "<rootDir>/src/cli/$1",
        "^@entry/(.*)$": "<rootDir>/src/entry/$1",
        "^@core/(.*)$": "<rootDir>/src/core/$1",
        "^@typing/(.*)$": "<rootDir>/src/types/$1"
    },
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: "tsconfig.jest.json"
            }
        ]
    },
    testMatch: ["**/*.test.ts"],
};

export default config;
