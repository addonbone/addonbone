import fs from "fs";

import content from "@cli/plugins/content";
import background from "@cli/plugins/background";

import {getConfigFile} from "@cli/resolvers/path";

import {Browser, Config, Mode, OptionalConfig, UserConfig} from "@typing/config";

export default async (config: OptionalConfig): Promise<Config> => {
    let {
        debug = false,
        configFile = 'addonbone.config.ts',
        app = 'myapp',
        browser = Browser.Chrome,
        inputDir = '.',
        outputDir = 'dist',
        srcDir = 'src',
        sharedDir = 'shared',
        appsDir = 'apps',
        jsDir = 'js',
        cssDir = 'css',
        assetsDir = 'assets',
        htmlDir = '.',
        manifestVersion = 3,
        mode = Mode.Development,
        analyze = false,
        plugins = [],
        mergeBackground = false,
        mergeContentScripts = false,
        concatContentScripts = true,
    } = config;

    let resolvedConfig: Config = {
        debug,
        mode,
        app,
        browser,
        manifestVersion,
        inputDir,
        outputDir,
        srcDir,
        sharedDir,
        appsDir,
        jsDir,
        cssDir,
        assetsDir,
        htmlDir,
        plugins,
        analyze,
        configFile,
        mergeBackground,
        mergeContentScripts,
        concatContentScripts,
    };

    const configFilePath = getConfigFile(resolvedConfig);

    if (fs.existsSync(configFilePath)) {
        const {default: userConfig = {} as UserConfig} = await import(configFilePath);

        if (debug) {
            console.log('Loaded user config:', configFilePath);
        }

        resolvedConfig = {...resolvedConfig, ...userConfig};
    } else if (debug) {
        console.warn('Config file not found:', configFilePath);
    }

    return {...resolvedConfig, plugins: [...resolvedConfig.plugins, content(), background()]};
}