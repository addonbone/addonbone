import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@main/plugin";

import TypescriptConfig from "./TypescriptConfig";
import VendorDeclaration from "./VendorDeclaration";

export {default as FileBuilder} from "./FileBuilder";
export {TypescriptConfig, VendorDeclaration};

export default definePlugin(() => {
    let typescript: TypescriptConfig;

    return {
        name: 'adnbn:typescript',
        startup: ({config}) => {
            typescript = TypescriptConfig.make(config);

            VendorDeclaration.make(config);
        },
        bundler: () => {
            return {
                resolve: {
                    extensions: [".ts", ".tsx", ".js"],
                    alias: typescript.aliases(),
                },
                module: {
                    rules: [
                        {
                            test: /\.tsx?$/,
                            loader: "builtin:swc-loader",
                            options: {
                                jsc: {
                                    parser: {
                                        syntax: "typescript",
                                        tsx: true
                                    },
                                    target: "es2020"
                                }
                            },
                            type: "javascript/auto"
                        }
                    ]
                }
            } satisfies RspackConfig;
        },
    };
});