import {ManifestBuilder} from "@typing/manifest";
import {Configuration as WebpackConfig} from "webpack";
import {ContentScript} from "@typing/content";
import {ConfigOptions} from "@typing/config";

export interface PluginManifestOptions extends ConfigOptions {
    manifest: ManifestBuilder;
}

export interface PluginWebpackOptions extends ConfigOptions {
    webpack: Partial<WebpackConfig>;
}

export interface PluginContentOptions extends ConfigOptions {
    contentScripts: ContentScript[];
}

export interface PluginContentResult {
    contentScripts: ContentScript[] | string | string[];
    fallbackName?: (name: string) => string;
}

export interface PluginBackgroundOptions extends ConfigOptions {
    files: string[];
}

export interface Plugin {
    content?: PluginHandler<PluginContentOptions, PluginContentResult>;
    background?: PluginHandler<PluginBackgroundOptions, string>;
    manifest?: PluginHandlerCallback<PluginManifestOptions>;
    webpack?: PluginHandler<PluginWebpackOptions, WebpackConfig>;
}

export type PluginHandler<O, T = void> = T | PluginHandlerCallback<O, T>;

export type PluginHandlerCallback<O, T = void> = { (options: O): T | Promise<T> }

export type PluginHandlerKeys = keyof Plugin;

export type PluginHandlerType<T extends Plugin[PluginHandlerKeys]> =
    T extends PluginHandlerCallback<infer O, infer R> ? { options: O; result: R } : never;

export type PluginHandlerOptions<K extends PluginHandlerKeys> =
    PluginHandlerType<Plugin[K]>['options'];

export type PluginHandlerResult<K extends PluginHandlerKeys> =
    NonNullable<PluginHandlerType<Plugin[K]>['result']>;

