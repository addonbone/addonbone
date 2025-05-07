import {Configuration as RspackConfig, RspackPluginInstance} from "@rspack/core";
import {CleanWebpackPlugin} from "clean-webpack-plugin";
import {RsdoctorRspackPlugin} from "@rsdoctor/rspack-plugin";
import {merge as mergeConfig} from "webpack-merge";
import path from "path";
import _ from "lodash";

import manifestFactory from "../builders/manifest";

import {getOutputPath, getRootPath} from "./path";
import {processPluginHandler} from "./plugin";

import ManifestPlugin from "@cli/bundler/plugins/ManifestPlugin";
import WatchPlugin from "@cli/bundler/plugins/WatchPlugin";

import {ReadonlyConfig} from "@typing/config";
import {Command} from "@typing/app";

const getConfigFromPlugins = async (rspack: RspackConfig, config: ReadonlyConfig): Promise<RspackConfig> => {
    let mergedConfig: RspackConfig = {};

    for await (const {result: pluginConfig} of processPluginHandler(config.plugins, 'bundler', {
        rspack: mergeConfig(rspack, mergedConfig),
        config
    })) {
        mergedConfig = mergeConfig(mergedConfig, pluginConfig);
    }

    return mergedConfig;
}

const getConfigForManifest = async (config: ReadonlyConfig): Promise<RspackConfig> => {
    const manifest = manifestFactory(config);

    const update = async () => await Array.fromAsync(processPluginHandler(config.plugins, 'manifest', {manifest, config}))

    await update();

    const plugins: RspackPluginInstance[] = [];

    if (config.command === Command.Watch) {
        plugins.push(new WatchPlugin(async () => {
            await update();
        }));
    }

    plugins.push(new ManifestPlugin(manifest));

    return {plugins};
}

export default async (config: ReadonlyConfig): Promise<RspackConfig> => {
    let rspack: RspackConfig = {
        entry: {},
        mode: config.mode,
        cache: false,
        output: {
            path: getRootPath(getOutputPath(config)),
            filename: path.join(config.jsDir, '[name].js'),
            hotUpdateGlobal: _.snakeCase(config.app) + 'HotUpdate',
            chunkLoadingGlobal: _.snakeCase(config.app) + 'ChunkLoading',
            devtoolNamespace: config.app,
            uniqueName: config.app
        },
        optimization: {
            usedExports: true,
            providedExports: true,
            sideEffects: true,
            splitChunks: {
                minSize: 10,
                cacheGroups: {
                    default: false,
                    defaultVendors: false,
                    // common: {
                    //     name: "common",
                    //     minChunks: 2,
                    //     priority: -20,
                    //     reuseExistingChunk: true,
                    // },
                },
            },
        },
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
                        },
                    }),
                ],
            });
        }
    }

    return rspack;
}