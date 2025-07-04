import type {Config} from "jest";

const config: Config = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "jsdom",
    setupFiles: ["<rootDir>/tests/jest.setup.ts"],
    moduleNameMapper: {
        "^@cli/(.*)$": "<rootDir>/src/cli/$1",
        "^@entry/(.*)$": "<rootDir>/src/entry/$1",
        "^@locale/(.*)$": "<rootDir>/src/locale/$1",
        "^@offscreen/(.*)$": "<rootDir>/src/offscreen/$1",
        "^@message/(.*)$": "<rootDir>/src/message/$1",
        "^@service/(.*)$": "<rootDir>/src/service/$1",
        "^@transport/(.*)$": "<rootDir>/src/transport/$1",
        "^@main/(.*)$": "<rootDir>/src/main/$1",
        "^@typing/(.*)$": "<rootDir>/src/types/$1",
    },
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: "tsconfig.jest.json",
            },
        ],
    },
    testMatch: ["**/*.test.ts"],
};

export default config;
