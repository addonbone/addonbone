import {DefinePlugin} from '@rspack/core';
import {type DotenvParseOutput} from "dotenv";

import {definePlugin} from "@core/define";

export default definePlugin((vars: DotenvParseOutput = {}) => {
    return {
        name: 'adnbn:dotenv',
        rspack: {
            plugins: [
                new DefinePlugin({
                    'process.env': JSON.stringify(vars)
                })
            ]
        }
    }
});