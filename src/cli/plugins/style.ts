import {rspack, type RuleSetUse} from '@rspack/core';
import path from "path";
import fs from "fs";

import {definePlugin} from "@core/define"

import {getAppSourcePath, getRootPath, getSharedPath} from "@cli/resolvers/path";

import {ReadonlyConfig} from "@typing/config";

const styleMergerLoader = (config: ReadonlyConfig) => (
    sharedStyle: string,
    sharedPath: string
): string | void => {
    const sharedDir = getRootPath(getSharedPath(config));

    if (sharedPath.startsWith(sharedDir)) {
        const relativePath = path.relative(sharedDir, sharedPath);

        const appDir = getRootPath(getAppSourcePath(config));
        const appPath = getRootPath(path.join(appDir, relativePath));

        if (fs.existsSync(appPath)) {
            try {
                let appStyle = fs.readFileSync(appPath, 'utf8');

                appStyle = appStyle.replace(/url\((['"]?)(.*?)\1\)/g, (match, quote, filePath) => {
                    const fileName = path.basename(filePath);
                    const newPath = path.join(appDir, path.dirname(relativePath), fileName);

                    return `url("${newPath}")`;
                });

                return sharedStyle + appStyle;
            } catch (error) {
                console.error(error);
            }
        }
    }
}

export default definePlugin(() => {
    return {
        name: 'adnbn:styles',
        bundler: ({config}) => {
            return {
                resolve: {
                    extensions: [".css", ".scss"],
                },
                plugins: [
                    new rspack.CssExtractRspackPlugin({
                        filename: path.join(config.cssDir, '[name].css'),
                        chunkFilename: path.join(config.cssDir, '[name].css'),
                    }),
                ],
                module: {
                    rules: [
                        {
                            test: /\.(scss|css)$/,
                            type: 'javascript/auto',
                            use: [
                                rspack.CssExtractRspackPlugin.loader,
                                {
                                    loader: 'css-loader',
                                    options: {
                                        esModule: true,
                                        modules: {
                                            exportLocalsConvention: 'as-is',
                                            namedExport: false,
                                            localIdentName: '[local]-[hash:base64:5]',
                                        }
                                    }
                                },
                                'sass-loader',
                                config.mergeStyles && {
                                    loader: 'source-modifier-loader',
                                    options: {
                                        modify: styleMergerLoader(config),
                                    }
                                }
                            ].filter(Boolean) as RuleSetUse,
                        }
                    ]
                },
            };
        }
    };
});