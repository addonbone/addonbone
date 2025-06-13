import {existsSync} from "fs";
import dotenv, {type DotenvParseOutput} from 'dotenv';
import {loadConfig} from "c12";

import {
    assetPlugin,
    authorPlugin,
    backgroundPlugin,
    contentPlugin,
    dotenvPlugin,
    htmlPlugin,
    iconPlugin,
    localePlugin,
    pagePlugin,
    popupPlugin,
    sidebarPlugin,
    reactPlugin,
    stylePlugin,
    typescriptPlugin,
    viewPlugin,
    versionPlugin,
    offscreenPlugin,
} from "../plugins";

import {getAppPath, getAppSourcePath, getConfigFile, getInputPath} from "../resolvers/path";

import {Config, OptionalConfig, ReadonlyConfig, UserConfig} from "@typing/config";
import {Command, Mode} from "@typing/app";
import {Browser} from "@typing/browser";
import {Plugin} from "@typing/plugin";
import {ManifestVersion} from "@typing/manifest";

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

        return userConfig || {};
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

    const appSourcePaths = preset.map((file) => getAppSourcePath(config, file));
    const appPaths = preset.map((file) => getAppPath(config, file));
    const rootPaths = preset.map((file) => getInputPath(config, file));

    const paths = [...appSourcePaths, ...appPaths, ...rootPaths];

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
        appSrcDir = '.',
        jsDir = 'js',
        cssDir = 'css',
        assetsDir = 'assets',
        htmlDir = '.',
        html = [],
        env = {},
        icon = {},
        locale = {},
        manifestVersion = (new Set<Browser>([Browser.Firefox, Browser.Safari]).has(browser) ? 2 : 3) as ManifestVersion,
        mode = Mode.Development,
        analyze = false,
        plugins = [],
        mergeBackground = false,
        mergeCommands = false,
        mergeContentScripts = false,
        concatContentScripts = true,
        mergeStyles = true,
        mergeIcons = false,
        mergeLocales = true,
        mergePages = false,
        mergePopup = false,
        multiplePopup = false,
        mergeSidebar = false,
        multipleSidebar = false,
        mergeRelay = false,
        mergeService = false,
        mergeOffscreen = false,
        version = 'VERSION',
        minimumVersion = "MINIMUM_VERSION",
        author = "",
        email = "EMAIL",
        homepage = "HOMEPAGE",
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
        appSrcDir,
        jsDir,
        cssDir,
        assetsDir,
        htmlDir,
        html,
        env,
        icon,
        locale,
        plugins,
        analyze,
        configFile,
        mergeBackground,
        mergeCommands,
        mergeContentScripts,
        concatContentScripts,
        mergeStyles,
        mergeIcons,
        mergeLocales,
        mergePages,
        mergePopup,
        multiplePopup,
        mergeSidebar,
        multipleSidebar,
        mergeRelay,
        mergeService,
        mergeOffscreen,
        version,
        minimumVersion,
        email,
        author,
        homepage,
    };

    let vars = loadDotenv(resolvedConfig);

    const {plugins: userPlugins = [], ...userConfig} = await getUserConfig(resolvedConfig);

    resolvedConfig = {...resolvedConfig, ...userConfig};

    vars = {...vars, ...loadDotenv(resolvedConfig)};

    const corePlugins: Plugin[] = [
        dotenvPlugin(vars),
        typescriptPlugin(),
        reactPlugin(),
        iconPlugin(),
        assetPlugin(),
        authorPlugin(),
        stylePlugin(),
        localePlugin(),
        contentPlugin(),
        backgroundPlugin(),
        popupPlugin(),
        sidebarPlugin(),
        offscreenPlugin(),
        pagePlugin(),
        viewPlugin(),
        htmlPlugin(),
        versionPlugin(),
    ];

    return {
        ...resolvedConfig,
        plugins: [
            ...plugins,
            ...userPlugins,
            ...corePlugins,
        ],
    };
}