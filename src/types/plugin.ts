import {ManifestBuilder} from "@typing/manifest";
import {Configuration as WebpackConfig} from "webpack";

import {ConfigOptions} from "@typing/config";
import {ContentScriptEntrypointMap} from "@typing/content";
import {EntrypointFile} from "@typing/entrypoint";

// Manifest
export interface PluginManifestOptions extends ConfigOptions {
    manifest: ManifestBuilder;
}

// Webpack
export interface PluginWebpackOptions extends ConfigOptions {
    webpack: Partial<WebpackConfig>;
}

// Content
export interface PluginContentOptions extends ConfigOptions {
    entries: ContentScriptEntrypointMap;
}

export type PluginContentResult = true | string | string[] | Record<string, string>;

// Background
export interface PluginBackgroundOptions extends ConfigOptions {
    //entries: BackgroundEntrypointMap;
}

export type PluginBackgroundResult = true | string | string[] | EntrypointFile | EntrypointFile[];

interface PluginName {
    name: string;
}

export interface Plugin extends PluginName {
    content?: PluginHandler<PluginContentOptions, PluginContentResult>;
    background?: PluginHandler<PluginBackgroundOptions, PluginBackgroundResult>;
    manifest?: PluginHandlerCallback<PluginManifestOptions>;
    webpack?: PluginHandler<PluginWebpackOptions, WebpackConfig>;
}

export type PluginHandler<O, T = void> = T | PluginHandlerCallback<O, T>;

export type PluginHandlerCallback<O, T = void> = { (options: O): T | Promise<T> }

export type PluginHandlerKeys = keyof Omit<Plugin, 'name'>;

export type PluginHandlerType<T extends Plugin[PluginHandlerKeys]> =
    T extends PluginHandlerCallback<infer O, infer R> ? { options: O; result: R } : never;

export type PluginHandlerOptions<K extends PluginHandlerKeys> =
    PluginHandlerType<Plugin[K]>['options'];

export type PluginHandlerResult<K extends PluginHandlerKeys> =
    NonNullable<PluginHandlerType<Plugin[K]>['result']>;

export interface PluginNameHandlerResult<K extends PluginHandlerKeys> extends PluginName {
    result: PluginHandlerResult<K>;
}

export type PluginDefinition<T> = ((options?: T) => Plugin) | Plugin;
