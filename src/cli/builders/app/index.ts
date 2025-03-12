import {rspack} from '@rspack/core';

import {build, watch} from "./command";

import configResolver from "../../resolvers/config";
import bundlerResolver from "../../resolvers/bundler";

import {OptionalConfig} from "@typing/config";
import {Command} from "@typing/app";

export default async (config: OptionalConfig): Promise<void> => {
    const resolverConfig = await configResolver(config);
    const rspackConfig = await bundlerResolver(resolverConfig);

    const compiler = rspack(rspackConfig);

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