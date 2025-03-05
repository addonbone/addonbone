import {ManifestBuilder} from "@typing/manifest";
import {Configuration as WebpackConfig} from "webpack";

import {ReadonlyConfig} from "@typing/config";
import {EntrypointFile} from "@typing/entrypoint";

export type PluginEntrypointResult = true | string | string[] | EntrypointFile | EntrypointFile[] | Set<EntrypointFile>;

export interface PluginConfigOptions {
    config: ReadonlyConfig;
}

// Manifest
export interface PluginManifestOptions extends PluginConfigOptions {
    manifest: ManifestBuilder;
}

// Webpack
export interface PluginWebpackOptions extends PluginConfigOptions {
    webpack: Partial<WebpackConfig>;
}

interface PluginName {
    name: string;
}

export interface Plugin extends PluginName {
    content?: PluginHandler<PluginConfigOptions, PluginEntrypointResult>;
    background?: PluginHandler<PluginConfigOptions, PluginEntrypointResult>;
    command?: PluginHandler<PluginConfigOptions, PluginEntrypointResult>;
    manifest?: PluginHandlerCallback<PluginManifestOptions>;
    webpack?: PluginHandler<PluginWebpackOptions, WebpackConfig>;
}

export type PluginHandler<O, T = void> = T | PluginHandlerCallback<O, T>;

export type PluginHandlerCallback<O, T = void> = { (options: O): T | Promise<T> }

export type PluginHandlerKeys = keyof Omit<Plugin, 'name'>;

export type PluginEntrypointKeys = keyof Pick<Plugin, 'content' | 'background' | 'command'>;

export type PluginHandlerType<T extends Plugin[PluginHandlerKeys]> =
    T extends PluginHandlerCallback<infer O, infer R> ? { options: O; result: R } : never;

export type PluginHandlerOptions<K extends PluginHandlerKeys> =
    PluginHandlerType<Plugin[K]>['options'];

export type PluginHandlerResult<K extends PluginHandlerKeys> =
    NonNullable<PluginHandlerType<Plugin[K]>['result']>;

export interface PluginNameHandlerResult<K extends PluginHandlerKeys> extends PluginName {
    result: PluginHandlerResult<K>;
}

export type PluginDefinition<T extends any[]> = ((...args: T) => Plugin) | Plugin;

export type PluginDefinitionInput<T extends any[], U> = U extends (...args: T) => any
    ? ReturnType<U> extends Plugin ? U : never
    : U extends Plugin ? U : never;
