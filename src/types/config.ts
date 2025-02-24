import {Plugin} from "@typing/plugin";
import {ManifestVersion} from "@typing/manifest";

export enum Browser {
    Chrome = 'chrome',
    Chromium = 'chromium',
    Edge = 'edge',
    Firefox = 'firefox',
    Opera = 'opera',
    Safari = 'safari',
}

export enum Mode {
    None = 'none',
    Development = 'development',
    Production = 'production',
}

export enum Command {
    Build = 'build',
    Watch = 'watch',
}

export interface Config {
    debug: boolean;
    command: Command;
    mode: Mode;
    app: string;
    browser: Browser;
    manifestVersion: ManifestVersion;
    inputDir: string;
    outputDir: string;
    srcDir: string;
    sharedDir: string;
    appsDir: string;
    jsDir: string;
    cssDir: string;
    assetsDir: string;
    htmlDir: string;
    plugins: Plugin[];
    analyze: boolean;
    configFile: string;
    mergeBackground: boolean;
    mergeCommands: boolean;
    mergeContentScripts: boolean;
    concatContentScripts: boolean;
}

export interface ConfigOptions {
    config: ReadonlyConfig;
}

export type OptionalConfig = Partial<Config>;
export type UserConfig = Omit<OptionalConfig, 'configFile' | 'command'>;
export type ReadonlyConfig = Readonly<Config>;

export type UserConfigCallback = (config: ReadonlyConfig) => UserConfig;
export type ConfigDefinition = UserConfigCallback | UserConfig;

