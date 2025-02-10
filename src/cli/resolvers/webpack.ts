import {Configuration} from "webpack";
import path from "path";

import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import manifestFactory from "../builders/manifest";

import {getRootPath} from "./path";
import {processPluginHandler} from "../utils/plugin";

import ManifestPlugin from "../webpack/plugins/ManifestPlugin";
import mergeWebpack from "../webpack/merge";

import {ReadonlyConfig} from "@typing/config";


const getConfigFromPlugins = async (webpack: Configuration, config: ReadonlyConfig): Promise<Configuration> => {
    let mergedConfig: Configuration = {};

    for await (const webpackFromPlugin of processPluginHandler(config, 'webpack', {webpack, config})) {
        mergedConfig = mergeWebpack(mergedConfig, webpackFromPlugin);
    }

    return mergedConfig;
}

const getConfigForManifest = async (webpack: Configuration, config: ReadonlyConfig): Promise<Configuration> => {
    const manifest = manifestFactory(config.browser, config.manifestVersion);

    await Array.fromAsync(processPluginHandler(config, 'manifest', {manifest, config}));

    return {
        plugins: [new ManifestPlugin(manifest)],
    };
}

export default async (config: ReadonlyConfig): Promise<Configuration> => {
    let webpack: Configuration = {
        mode: config.mode,
        cache: false,
        output: {
            path: getRootPath(path.join(config.outputDir, `${config.app}-${config.browser}-mv${config.manifestVersion}`)),
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
        await getConfigForManifest(webpack, config),
    );

    return webpack;
}