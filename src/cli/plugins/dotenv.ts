import webpack from "webpack";
import {type DotenvParseOutput} from "dotenv";

import {definePlugin} from "@core/define";

export default definePlugin((vars: DotenvParseOutput = {}) => {
    return {
        name: 'adnbn:dotenv',
        webpack: {
            plugins: [
                new webpack.DefinePlugin({
                    'process.env': JSON.stringify(vars)
                })
            ],
        }
    }
});