import cac from 'cac';

import {Browser} from "@typing/config";
import app from "./builders/app";

const cli = cac('addonbone');

cli.option('--debug', 'Enable debug mode');

cli
    .command('[root]', 'Start dev server')
    .option('-m, --mode <mode>', 'Set env mode', {default: 'development',})
    .option('-c, --config <config>', 'Path to config file')
    .option('-a, --app <app>', 'Specify an app to run', {default: 'myapp'})
    .option('-b, --browser <browser>', 'Specify a browser')
    .option('-p, --port <port>', 'Specify a port for the dev server')
    .option('--mv2', 'Target manifest v2')
    .action((root, options) => {
        console.log(options)
    });

cli
    .command('build [root]', 'Build for production')
    .option('-m, --mode <mode>', 'Set env mode', {default: 'production'})
    .option('-c, --config <config>', 'Path to config file')
    .option('-a, --app <app>', 'Specify an app to run', {default: 'myapp'})
    .option('-b, --browser <browser>', 'Specify a browser', {default: Browser.Chrome})
    .option('--mv2', 'Target manifest v2')
    .option('--analyze', 'Visualize extension bundle')
    .action(async (root, options) => {
        await app({
            mode: options.mode,
            debug: options.debug,
            app: options.app,
            browser: options.browser,
            manifestVersion: options.mv2 ? 2 : 3,
            inputDir: root,
            configFile: options.config,
        });
    });

cli.help();
cli.parse();