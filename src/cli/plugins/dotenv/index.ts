import _ from "lodash";

import {DefinePlugin} from '@rspack/core';

import {definePlugin} from "@main/plugin";

import {encryptData, generateCryptoKey} from "./utils";

import {type DotenvParseOutput} from "dotenv";

export default definePlugin((vars: DotenvParseOutput = {}) => {
    return {
        name: 'adnbn:dotenv',
        bundler: ({config}) => {
            const {filter, crypt} = config.env;

            const filteredVars = !filter ? vars : Object.fromEntries(Object.entries(vars).filter(([key]) => {
                if (
                    ['APP', 'BROWSER', 'MODE', 'MANIFEST_VERSION'].includes(key) ||
                    (_.isFunction(filter) && filter(key)) ||
                    (_.isString(filter) && filter.trim() && key.startsWith(filter.trim()))
                ) {
                    return true;
                }
            }));

            const key = generateCryptoKey([config.app, ...Object.keys(filteredVars)].join('-'));

            const data = crypt ? encryptData(filteredVars, key) : filteredVars;

            return {
                plugins: [
                    new DefinePlugin({
                        __ADNBN_ENV_CRYPTO_KEY__: JSON.stringify(key),
                        'process.env': JSON.stringify(data),
                    })
                ]
            }
        }
    }
});
