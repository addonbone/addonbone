import {Configuration, WebpackPluginInstance} from "webpack";
import path from "path";

import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import manifestFactory from "../builders/manifest";

import {getOutputPath, getRootPath} from "./path";
import {processPluginHandler} from "../utils/plugin";

import ManifestPlugin from "../webpack/plugins/ManifestPlugin";
import WatchPlugin from "../webpack/plugins/WatchPlugin";
import mergeWebpack from "../webpack/merge";

import {Command, Mode, ReadonlyConfig} from "@typing/config";


const getConfigFromPlugins = async (webpack: Configuration, config: ReadonlyConfig): Promise<Configuration> => {
    let mergedConfig: Configuration = {};

    for await (const webpackFromPlugin of processPluginHandler(config, 'webpack', {webpack, config})) {
        mergedConfig = mergeWebpack(mergedConfig, webpackFromPlugin);
    }

    return mergedConfig;
}

const getConfigForManifest = async (config: ReadonlyConfig): Promise<Configuration> => {
    const manifest = manifestFactory(config.browser, config.manifestVersion);

    const update = async () => await Array.fromAsync(processPluginHandler(config, 'manifest', {manifest, config}))

    await update();

    const plugins: WebpackPluginInstance[] = [];

    if (config.mode === Mode.Development) {
        plugins.push(new WatchPlugin({
            key: 'manifest',
            callback: async () => {
                await update();
            }
        }));
    }

    plugins.push(new ManifestPlugin(manifest));

    return {plugins};
}

export default async (command: Command, config: ReadonlyConfig): Promise<Configuration> => {
    let webpack: Configuration = {
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
                    exclude: /node_modules/,
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

    if (command == Command.Watch) {
        webpack = mergeWebpack(webpack, {
            devtool: 'inline-source-map',
        });
    }

    return webpack;
}