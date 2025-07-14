import {existsSync} from "fs";
import dotenv, {type DotenvParseOutput} from "dotenv";
import {loadConfig} from "c12";
import _ from "lodash";

import {
    assetPlugin,
    backgroundPlugin,
    contentPlugin,
    dotenvPlugin,
    htmlPlugin,
    iconPlugin,
    localePlugin,
    metaPlugin,
    offscreenPlugin,
    optimizationPlugin,
    outputPlugin,
    pagePlugin,
    popupPlugin,
    publicPlugin,
    reactPlugin,
    sidebarPlugin,
    stylePlugin,
    typescriptPlugin,
    versionPlugin,
    viewPlugin,
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
            console.log("Loaded user config:", configFilePath);
        }

        return userConfig || {};
    } else if (config.debug) {
        console.warn("Config file not found:", configFilePath);
    }

    return {};
};

const validateConfig = (config: ReadonlyConfig): ReadonlyConfig => {
    const {
        outputDir,
        srcDir,
        sharedDir,
        appsDir,
        appSrcDir,
        jsDir,
        cssDir,
        assetsDir,
        htmlDir,
        publicDir,
        locale,
        icon,
    } = config;

    if (
        [
            outputDir,
            srcDir,
            sharedDir,
            appsDir,
            appSrcDir,
            jsDir,
            cssDir,
            assetsDir,
            htmlDir,
            publicDir,
            locale.dir,
            icon.outputDir,
            icon.sourceDir,
        ]
            .filter(dir => _.isString(dir))
            .some(dir => dir.includes(".."))
    ) {
        throw new Error('Directory paths cannot contain relative paths ("..") for security reasons.');
    }

    if (appsDir === sharedDir) {
        throw new Error("Apps directory (appsDir) and shared directory (sharedDir) cannot be the same.");
    }

    if (srcDir === outputDir) {
        throw new Error("Source directory (srcDir) and destination directory (outputDir) cannot be the same.");
    }

    if (srcDir === ".") {
        throw new Error('Source directory cannot be the root directory (".") for security reasons.');
    }

    if (publicDir === "." || [srcDir, outputDir, appSrcDir].includes(publicDir)) {
        throw new Error(
            'Public directory cannot be the root directory (".") or intersect with other root directories for security reasons.'
        );
    }

    return config;
};

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
};

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

    const appSourcePaths = preset.map(file => getAppSourcePath(config, file));
    const appPaths = preset.map(file => getAppPath(config, file));
    const rootPaths = preset.map(file => getInputPath(config, file));

    const paths = [...appSourcePaths, ...appPaths, ...rootPaths];

    const {parsed: fileVars = {}} = dotenv.config({path: paths});

    return {...fileVars, ...updateLocalDotenv(config)};
};

export default async (config: OptionalConfig): Promise<Config> => {
    let {
        command = Command.Build,
        debug = false,
        configFile = "adnbn.config.ts",
        browser = Browser.Chrome,
        app = "myapp",
        version = "VERSION",
        minimumVersion = "MINIMUM_VERSION",
        author = undefined,
        email = "EMAIL",
        homepage = "HOMEPAGE",
        incognito,
        inputDir = ".",
        outputDir = "dist",
        srcDir = "src",
        sharedDir = "shared",
        appsDir = "apps",
        appSrcDir = ".",
        jsDir = "js",
        cssDir = "css",
        assetsDir = "assets",
        publicDir = "public",
        htmlDir = ".",
        html = [],
        env = {},
        icon = {},
        locale = {},
        manifestVersion = (new Set<Browser>([Browser.Safari]).has(browser) ? 2 : 3) as ManifestVersion,
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
        mergePublic = false,
        multiplePopup = false,
        mergeSidebar = false,
        multipleSidebar = false,
        mergeRelay = false,
        mergeService = false,
        mergeOffscreen = false,
        commonChunks = true,
        assetsFilename = mode === Mode.Production && command === Command.Build && !debug
            ? "[contenthash:4][ext]"
            : "[name]-[contenthash:4][ext]",
        jsFilename = mode === Mode.Production && command === Command.Build && !debug
            ? "[contenthash:5].js"
            : "[name].js",
        cssFilename = mode === Mode.Production && command === Command.Build && !debug
            ? "[contenthash:5].css"
            : "[name].css",
        cssIdentName = mode === Mode.Production && command === Command.Build && !debug
            ? "[app]-[hash:base64:5]"
            : "[local]-[hash:base64:5]",
    } = config;

    let resolvedConfig: Config = {
        command,
        debug,
        mode,
        browser,
        app,
        version,
        minimumVersion,
        email,
        author,
        homepage,
        incognito,
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
        publicDir,
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
        mergePublic,
        multiplePopup,
        mergeSidebar,
        multipleSidebar,
        mergeRelay,
        mergeService,
        mergeOffscreen,
        commonChunks,
        assetsFilename,
        jsFilename,
        cssFilename,
        cssIdentName,
    };

    let vars = loadDotenv(resolvedConfig);

    const {plugins: userPlugins = [], ...userConfig} = await getUserConfig(resolvedConfig);

    resolvedConfig = validateConfig({...resolvedConfig, ...userConfig});

    vars = {...vars, ...loadDotenv(resolvedConfig)};

    const corePlugins: Plugin[] = [
        dotenvPlugin(vars),
        outputPlugin(),
        optimizationPlugin(),
        typescriptPlugin(),
        reactPlugin(),
        iconPlugin(),
        assetPlugin(),
        stylePlugin(),
        localePlugin(),
        metaPlugin(),
        contentPlugin(),
        backgroundPlugin(),
        popupPlugin(),
        publicPlugin(),
        sidebarPlugin(),
        offscreenPlugin(),
        pagePlugin(),
        viewPlugin(),
        htmlPlugin(),
        versionPlugin(),
    ];

    return {
        ...resolvedConfig,
        plugins: [...plugins, ...userPlugins, ...corePlugins],
    };
};
