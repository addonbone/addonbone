import {Command, Mode} from "@typing/app";
import {Browser} from "@typing/browser";
import {ManifestVersion} from "@typing/manifest";
import {Plugin} from "@typing/plugin";

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
    appSrcDir: string;
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

export type OptionalConfig = Partial<Config>;
export type UserConfig = Omit<OptionalConfig, 'configFile' | 'command'>;
export type ReadonlyConfig = Readonly<Config>;

export type UserConfigCallback = (config: ReadonlyConfig) => UserConfig;
export type ConfigDefinition = UserConfigCallback | UserConfig;
