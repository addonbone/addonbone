import {Plugin, PluginDefinition} from "@typing/plugin";

export type {Plugin, PluginDefinition};

export function definePlugin<T extends any[] = []>(plugin: PluginDefinition<T>): PluginDefinition<T> {
    return plugin;
}