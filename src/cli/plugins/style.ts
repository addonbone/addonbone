import {rspack, RuleSetUse, Configuration as RspackConfig} from '@rspack/core';
import path from "path";
import fs from "fs";
import {createHash} from "crypto";
import _ from "lodash";

import {definePlugin} from "@main/plugin"

import {getAppSourcePath, getRootPath, getSharedPath} from "@cli/resolvers/path";

import {ReadonlyConfig} from "@typing/config";
import {appFilenameResolver} from "@cli/bundler";

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
                    const cssDir = path.dirname(appPath);
                    const assetAbs = path.resolve(cssDir, filePath);
                    return `url("${assetAbs}")`;
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
            const {app, cssDir, cssFilename, cssIdentName} = config;

            const filename = appFilenameResolver(app, cssFilename, cssDir);

            return {
                resolve: {
                    extensions: [".css", ".scss"],
                },
                plugins: [
                    new rspack.CssExtractRspackPlugin({
                        filename,
                        chunkFilename: filename,
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
                                            localIdentName: cssIdentName.replaceAll('[app]', _.kebabCase(app)),
                                            localIdentHashSalt: createHash('sha256').update(app).digest('hex'),
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
            } satisfies RspackConfig;
        }
    };
});