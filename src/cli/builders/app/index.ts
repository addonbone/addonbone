import webpack from 'webpack';

import {build, watch} from "./command";

import configResolver from "../../resolvers/config";
import webpackResolver from "../../resolvers/webpack";

import {Command, OptionalConfig} from "@typing/config";

export default async (command: Command, config: OptionalConfig): Promise<void> => {
    const resolverConfig = await configResolver(config);
    const webpackConfig = await webpackResolver(command, resolverConfig);

    const compiler = webpack(webpackConfig);

    switch (command) {
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