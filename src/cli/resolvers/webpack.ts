import {Configuration, WebpackPluginInstance} from "webpack";
import path from "path";

import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {CleanWebpackPlugin} from "clean-webpack-plugin";

import manifestFactory from "../builders/manifest";

import {getOutputPath, getRootPath} from "./path";
import {processPluginHandler} from "./plugin";

import ManifestPlugin from "../webpack/plugins/ManifestPlugin";
import WatchPlugin from "../webpack/plugins/WatchPlugin";
import mergeWebpack from "../webpack/utils/mergeConfig";

import {Command, ReadonlyConfig} from "@typing/config";

const getConfigFromPlugins = async (webpack: Configuration, config: ReadonlyConfig): Promise<Configuration> => {
    let mergedConfig: Configuration = {};

    for await (const {result: pluginConfig} of processPluginHandler(config, 'webpack', {webpack, config})) {
        mergedConfig = mergeWebpack(mergedConfig, pluginConfig);
    }

    return mergedConfig;
}

const getConfigForManifest = async (config: ReadonlyConfig): Promise<Configuration> => {
    const manifest = manifestFactory(config.browser, config.manifestVersion);

    const update = async () => await Array.fromAsync(processPluginHandler(config, 'manifest', {manifest, config}))

    await update();

    const plugins: WebpackPluginInstance[] = [];

    if (config.command === Command.Watch) {
        plugins.push(new WatchPlugin(async () => {
            await update();
        }, 'manifest'));
    }

    plugins.push(new ManifestPlugin(manifest));

    return {plugins};
}

export default async (config: ReadonlyConfig): Promise<Configuration> => {
    let webpack: Configuration = {
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
            plugins: [new TsconfigPathsPlugin()],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: "ts-loader",
                },
                {
                    test: /\.(scss|css)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                modules: {
                                    localIdentName: "[local]"
                                },
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                implementation: import("sass"),
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|apng|jpe?g|gif|webp|svg])$/i,
                    type: "asset/resource",
                },
            ],
        }
    }

    webpack = mergeWebpack(
        webpack,
        await getConfigFromPlugins(webpack, config),
        await getConfigForManifest(config),
    );

    if (config.command == Command.Watch) {
        webpack = mergeWebpack(webpack, {
            devtool: 'inline-source-map',
        });
    }

    if (config.command == Command.Build) {
        webpack = mergeWebpack(webpack, {
            plugins: [
                new CleanWebpackPlugin(),
            ],
        });
    }

    return webpack;
}