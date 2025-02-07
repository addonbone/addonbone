import {existsSync} from "fs";
import {loadConfig} from "c12";

import content from "@cli/plugins/content";
import background from "@cli/plugins/background";

import {getConfigFile} from "@cli/resolvers/path";

import {Browser, Config, Mode, OptionalConfig, ReadonlyConfig, UserConfig,} from "@typing/config";
import {Plugin} from "@typing/plugin";

const getUserConfig = async (config: ReadonlyConfig): Promise<UserConfig> => {
    const configFilePath = getConfigFile(config);

    if (existsSync(configFilePath)) {
        const {config: userConfig} = await loadConfig<UserConfig>({configFile: configFilePath});

        if (config.debug) {
            console.log('Loaded user config:', configFilePath);
        }

        return userConfig
    } else if (config.debug) {
        console.warn('Config file not found:', configFilePath);
    }

    return {};
}

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
        manifestVersion = [Browser.Firefox, Browser.Safari].includes(browser) ? 2 : 3,
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

    const {plugins: userPlugins = [], ...userConfig} = await getUserConfig(resolvedConfig);

    const corePlugins: Plugin[] = [content(), background()];

    return {
        ...resolvedConfig,
        ...userConfig,
        plugins: [
            ...plugins,
            ...userPlugins,
            ...corePlugins,
        ]
    };
}