import webpack from 'webpack';

import {build, watch} from "./command";

import configResolver from "../../resolvers/config";
import webpackResolver from "../../resolvers/webpack";

import {Command, OptionalConfig} from "@typing/config";

export default async (config: OptionalConfig): Promise<void> => {
    const resolverConfig = await configResolver(config);
    const webpackConfig = await webpackResolver(resolverConfig);

    const compiler = webpack(webpackConfig);

    switch (resolverConfig.command) {
        case Command.Build:
            build(compiler);
            break;

        case Command.Watch:
            watch(compiler);
            break;

        default:
            console.error('Unknown command');
            process.exit(1);
    }
}