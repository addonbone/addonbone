import cac from "cac";
import {consola} from "consola";

import app from "./builders/app";

import {Command} from "@typing/app";
import {Browser} from "@typing/browser";

import {name, version} from "../../package.json";

const cli = cac(name);

cli.option("--debug", "Enable debug mode");

cli.command("init", "Initialize a new project").action(() => {
    consola.box("Coming soon...");
});

cli.command("watch [root]", "Start watch mode")
    .option("-m, --mode <mode>", "Set env mode", {default: "development"})
    .option("-c, --config <config>", "Path to config file")
    .option("-a, --app <app>", "Specify an app to run", {default: "myapp"})
    .option("-b, --browser <browser>", "Specify a browser")
    .option("--mv2", "Target manifest v2")
    .action(async (root, options) => {
        try {
            await app({
                command: Command.Watch,
                mode: options.mode,
                debug: options.debug,
                app: options.app,
                browser: options.browser,
                manifestVersion: options.mv2 ? 2 : 3,
                inputDir: root,
                configFile: options.config,
            });
        } catch (e) {
            consola.error(e);
        }
    });

cli.command("build [root]", "Build for production")
    .option("-m, --mode <mode>", "Set env mode", {default: "production"})
    .option("-c, --config <config>", "Path to config file")
    .option("-a, --app <app>", "Specify an app to run", {default: "myapp"})
    .option("-b, --browser <browser>", "Specify a browser", {default: Browser.Chrome})
    .option("--mv2", "Target manifest v2")
    .option("--analyze", "Visualize extension bundle")
    .action(async (root, options) => {
        try {
            await app({
                command: Command.Build,
                mode: options.mode,
                debug: options.debug,
                app: options.app,
                browser: options.browser,
                manifestVersion: options.mv2 ? 2 : 3,
                inputDir: root,
                configFile: options.config,
                analyze: options.analyze,
            });
        } catch (e) {
            consola.error(e);
        }
    });

cli.version(version);
cli.help();
cli.parse();
