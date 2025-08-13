import {createHash} from "crypto";
import {DefinePlugin} from "@rspack/core";

import {definePlugin} from "@main/plugin";

import {encryptData} from "./crypt";
import {filterEnvVars, resolveEnvOptions} from "./utils";

import {type DotenvParseOutput} from "dotenv";

const generateKey = (value: string): string => {
    return createHash("sha256").update(value).digest("base64");
};

export default definePlugin((vars: DotenvParseOutput = {}) => {
    return {
        name: "adnbn:dotenv",
        bundler: ({config}) => {
            const {filter, crypt} = resolveEnvOptions(config.env);

            const filteredVars = filterEnvVars(vars, filter);

            const key = generateKey([config.app, ...Object.keys(filteredVars)].join("-"));

            const data = crypt ? encryptData(filteredVars, key) : filteredVars;

            return {
                plugins: [
                    new DefinePlugin({
                        __ADNBN_ENV_CRYPTO_KEY__: JSON.stringify(key),
                        "process.env": JSON.stringify(data),
                    }),
                ],
            };
        },
    };
});
