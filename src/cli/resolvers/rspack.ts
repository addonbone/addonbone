import {Configuration, RspackPluginInstance} from "@rspack/core";
import {CleanWebpackPlugin} from "clean-webpack-plugin";
import {RsdoctorRspackPlugin} from "@rsdoctor/rspack-plugin";
import path from "path";

import manifestFactory from "../builders/manifest";

import {getOutputPath, getRootPath} from "./path";
import {processPluginHandler} from "./plugin";

import ManifestPlugin from "@cli/rspack/plugins/ManifestPlugin";
import WatchPlugin from "@cli/rspack/plugins/WatchPlugin";
import mergeConfig from "@cli/rspack/utils/mergeConfig";

import {ReadonlyConfig} from "@typing/config";
import {Command} from "@typing/app";

const getConfigFromPlugins = async (rspack: Configuration, config: ReadonlyConfig): Promise<Configuration> => {
    let mergedConfig: Configuration = {};

    for await (const {result: pluginConfig} of processPluginHandler(config, 'rspack', {rspack, config})) {
        mergedConfig = mergeConfig(mergedConfig, pluginConfig);
    }

    return mergedConfig;
}

const getConfigForManifest = async (config: ReadonlyConfig): Promise<Configuration> => {
    const manifest = manifestFactory(config.browser, config.manifestVersion);

    const update = async () => await Array.fromAsync(processPluginHandler(config, 'manifest', {manifest, config}))

    await update();

    const plugins: RspackPluginInstance[] = [];

    if (config.command === Command.Watch) {
        plugins.push(new WatchPlugin(async () => {
            await update();
        }, 'manifest'));
    }

    plugins.push(new ManifestPlugin(manifest));

    return {plugins};
}

export default async (config: ReadonlyConfig): Promise<Configuration> => {
    let rspack: Configuration = {
        entry: {},
        mode: config.mode,
        cache: false,
        output: {
            path: getRootPath(getOutputPath(config)),
            filename: path.join(config.jsDir, '[name].js'),
            assetModuleFilename: path.join(config.assetsDir, '[name]-[hash:4][ext]'),
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".scss"],
            alias: {
                [config.srcDir]: getRootPath(path.join(config.srcDir))
            }
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "builtin:swc-loader",
                    options: {
                        sourceMap: true,
                        jsc: {
                            parser: {
                                syntax: "typescript",
                                tsx: true
                            }
                        }
                    }
                },
                {
                    test: /\.(scss|css)$/,
                    use: [
                        {
                            loader: "css-loader",
                            options: {
                                modules: {
                                    localIdentName: "[local]"
                                }
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                implementation: "sass"
                            }
                        }
                    ],
                    type: "css"
                },
                {
                    test: /\.(png|apng|jpe?g|gif|webp)$/i,
                    type: "asset/resource"
                }
            ]
        }
    }

    rspack = mergeConfig(
        rspack,
        await getConfigFromPlugins(rspack, config),
        await getConfigForManifest(config),
    );

    if (config.debug) {
        rspack = mergeConfig(rspack, {
            stats: {
                errorDetails: true,
            },
        });
    }

    if (config.command == Command.Watch) {
        rspack = mergeConfig(rspack, {
            devtool: 'inline-source-map',
        });
    }

    if (config.command == Command.Build) {
        rspack = mergeConfig(rspack, {
            plugins: [
                new CleanWebpackPlugin(),
            ],
        });

        if (config.analyze) {
            rspack = mergeConfig(rspack, {
                plugins: [
                    new RsdoctorRspackPlugin({
                        supports: {
                            banner: true,
                            parseBundle: true,
                            generateTileGraph: true,
                        }
                    }),
                ],
            });
        }
    }

    return rspack;
}