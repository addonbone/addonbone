import {ManifestBuilder} from "@typing/manifest";
import {Configuration as RspackConfig} from "@rspack/core";

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

// Rspack
export interface PluginBundlerOptions extends PluginConfigOptions {
    rspack: RspackConfig;
}

interface PluginName {
    name: string;
}

export interface Plugin extends PluginName {
    content?: PluginHandler<PluginConfigOptions, PluginEntrypointResult>;
    background?: PluginHandler<PluginConfigOptions, PluginEntrypointResult>;
    command?: PluginHandler<PluginConfigOptions, PluginEntrypointResult>;
    manifest?: PluginHandlerCallback<PluginManifestOptions>;
    bundler?: PluginHandler<PluginBundlerOptions, RspackConfig>;
}

export type PluginHandler<O, T = void> = T | PluginHandlerCallback<O, T>;

export type PluginHandlerCallback<O, T = void> = { (options: O): T | Promise<T> }

export type PluginHandlerKeys = keyof Omit<Plugin, 'name'>;

export type PluginEntrypointKeys = keyof Pick<Plugin, 'background' | 'command' | 'content'>;

export type PluginHandlerType<T extends Plugin[PluginHandlerKeys]> =
    T extends PluginHandlerCallback<infer O, infer R> ? { options: O; result: R } : never;

export type PluginHandlerOptions<K extends PluginHandlerKeys> =
    PluginHandlerType<Plugin[K]>['options'];

export type PluginHandlerResult<K extends PluginHandlerKeys> =
    NonNullable<PluginHandlerType<Plugin[K]>['result']>;

export interface PluginNameHandlerResult<K extends PluginHandlerKeys> extends PluginName {
    result: PluginHandlerResult<K>;
}

export type PluginDefinition<T extends any[] = []> = (...args: T) => Plugin;
