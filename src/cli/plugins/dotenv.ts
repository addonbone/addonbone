import {DefinePlugin} from '@rspack/core';
import {type DotenvParseOutput} from "dotenv";

import {definePlugin} from "@main/plugin";

export default definePlugin((vars: DotenvParseOutput = {}) => {
    return {
        name: 'adnbn:dotenv',
        bundler: {
            plugins: [
                new DefinePlugin({
                    'process.env': JSON.stringify(vars)
                })
            ]
        }
    }
});