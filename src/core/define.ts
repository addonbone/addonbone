import {ConfigDefinition} from "@typing/config";
import {BackgroundDefinition} from "@typing/background";
import {ContentScriptDefinition} from "@typing/content";
import {Plugin, PluginDefinition} from "@typing/plugin";
import {CommandDefinition} from "@typing/command";

export function defineConfig(config: ConfigDefinition): ConfigDefinition {
    return config;
}

export function definePlugin<T>(plugin: (options?: T) => Plugin): (options?: T) => Plugin;
export function definePlugin(plugin: Plugin): Plugin;

export function definePlugin<T>(plugin: PluginDefinition<T>): PluginDefinition<T> {
    return plugin;
}

export function defineBackground(options: BackgroundDefinition): BackgroundDefinition {
    return options;
}

export function defineCommand(options: CommandDefinition): CommandDefinition {
    return options;
}

export function defineContentScript(options: ContentScriptDefinition): ContentScriptDefinition {
    return options;
}