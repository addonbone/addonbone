import webpack from "webpack";
import {type DotenvParseOutput} from "dotenv";

import {definePlugin} from "@core/define";

export interface DotenvOptions {
    vars: DotenvParseOutput;
}

export default definePlugin<DotenvOptions>((options) => {
    const {vars = {}} = options || {};

    return {
        webpack: {
            plugins: [
                new webpack.DefinePlugin({
                    'process.env': JSON.stringify(vars)
                })
            ],
        }
    }
});