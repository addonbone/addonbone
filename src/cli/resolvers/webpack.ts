import {Configuration} from "webpack";
import {merge} from "webpack-merge";
import path from "path";

import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import manifestFactory from "@cli/builders/manifest";

import {ReadonlyConfig} from "@typing/config";

import {getRootPath} from "./path";
import {processPluginHandler} from "@cli/utils/plugin";

const getConfigFromPlugins = async (webpack: Configuration, config: ReadonlyConfig): Promise<Configuration> => {
    let mergedConfig: Configuration = {};

    for await (const webpackFromPlugin of processPluginHandler(config, 'webpack', {webpack, config})) {
        mergedConfig = merge(mergedConfig, webpackFromPlugin);
    }

    return mergedConfig;
}

const applyConfigForManifest = async (webpack: Configuration, config: ReadonlyConfig): Promise<Configuration> => {
    const manifest = manifestFactory(config.manifestVersion);

    for await (const _ of processPluginHandler(config, 'manifest', {manifest, config})) {

    }

    console.log(manifest.get());

    return webpack;
}

export default async (config: ReadonlyConfig): Promise<Configuration> => {
    let webpack: Configuration = {
        mode: config.mode,
        cache: false,
        output: {
            path: getRootPath(config.outputDir),
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
                                implementation: require("sass"),
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

    webpack = merge(webpack, await getConfigFromPlugins(webpack, config), await applyConfigForManifest(webpack, config));


    return webpack;
}