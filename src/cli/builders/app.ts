import webpack from 'webpack';

import {OptionalConfig} from "@typing/config";
import configResolver from "../resolvers/config";
import webpackResolver from "../resolvers/webpack";

export default async (config: OptionalConfig): Promise<void> => {
    const resolverConfig = await configResolver(config);
    const webpackConfig = await webpackResolver(resolverConfig);

    const compiler = webpack(webpackConfig);

    compiler.run((err, stats) => {
        if (err) {
            console.error('Webpack compilation error');
            process.exit(1);
        }

        console.log(stats?.toString({ colors: true }));
    });
}