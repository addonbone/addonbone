import {existsSync} from "fs";
import dotenv, {type DotenvParseOutput} from 'dotenv';
import {loadConfig} from "c12";

import dotenvPlugin from "../plugins/dotenv";
import backgroundPlugin from "../plugins/background";

import {getAppsPath, getConfigFile, getInputPath} from "../resolvers/path";

import {Browser, Command, Config, Mode, OptionalConfig, ReadonlyConfig, UserConfig,} from "@typing/config";
import {Plugin} from "@typing/plugin";


const getUserConfig = async (config: ReadonlyConfig): Promise<UserConfig> => {
    const configFilePath = getConfigFile(config);

    if (existsSync(configFilePath)) {
        const {config: userConfig} = await loadConfig<UserConfig>({
            configFile: configFilePath,
            dotenv: true,
        });

        if (config.debug) {
            console.log('Loaded user config:', configFilePath);
        }

        return userConfig
    } else if (config.debug) {
        console.warn('Config file not found:', configFilePath);
    }

    return {};
}

const updateLocalDotenv = (config: ReadonlyConfig): DotenvParseOutput => {
    const {mode, app, browser, manifestVersion} = config;

    const localVars: DotenvParseOutput = {
        APP: app,
        BROWSER: browser,
        MODE: mode,
        MANIFEST_VERSION: String(manifestVersion),
    };

    Object.assign(process.env, localVars);

    return localVars;
}

const loadDotenv = (config: ReadonlyConfig): DotenvParseOutput => {
    const {mode, browser} = config;

    const preset = [
        `.env.${mode}.${browser}.local`,
        `.env.${mode}.${browser}`,
        `.env.${browser}.local`,
        `.env.${browser}`,
        `.env.${mode}.local`,
        `.env.${mode}`,
        `.env.local`,
        `.env`,
    ];

    const appPaths = preset.map((file) => getAppsPath(config, file));
    const rootPaths = preset.map((file) => getInputPath(config, file));

    const paths = [...appPaths, ...rootPaths];

    const {parsed: fileVars = {}} = dotenv.config({path: paths});

    return {...fileVars, ...updateLocalDotenv(config)};
}

export default async (config: OptionalConfig): Promise<Config> => {
    let {
        command = Command.Build,
        debug = false,
        configFile = 'adnbn.config.ts',
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
        mergeCommands = false,
        mergeContentScripts = false,
        concatContentScripts = true,
    } = config;

    let resolvedConfig: Config = {
        command,
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
        mergeCommands,
        mergeContentScripts,
        concatContentScripts,
    };

    let vars = loadDotenv(resolvedConfig);

    const {plugins: userPlugins = [], ...userConfig} = await getUserConfig(resolvedConfig);

    resolvedConfig = {...resolvedConfig, ...userConfig};

    vars = {...vars, ...loadDotenv(resolvedConfig)};

    const corePlugins: Plugin[] = [
        dotenvPlugin({vars}),
        // contentPlugin(),
        backgroundPlugin(),
    ];

    return {
        ...resolvedConfig,
        plugins: [
            ...plugins,
            ...userPlugins,
            ...corePlugins,
        ]
    };
}