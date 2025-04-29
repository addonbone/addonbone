import {contentScriptMountAppendResolver} from "@entry/content";

import {ConfigDefinition} from "@typing/config";
import {BackgroundDefinition} from "@typing/background";
import {ContentScriptAppendDefinition, ContentScriptDefinition} from "@typing/content";
import {PluginDefinition} from "@typing/plugin";
import {CommandDefinition, CommandExecuteActionName, ExecuteActionCommandDefinition} from "@typing/command";
import {PageDefinition} from "@typing/page";
import {ServiceDefinition, ServiceType} from "@typing/service";

export const defineConfig = (config: ConfigDefinition): ConfigDefinition => {
    return config;
}

export function definePlugin<T extends any[] = []>(plugin: PluginDefinition<T>): PluginDefinition<T> {
    return plugin;
}

export const defineBackground = (options: BackgroundDefinition): BackgroundDefinition => {
    return options;
}

export const defineCommand = (options: CommandDefinition): CommandDefinition => {
    return options;
}

export const defineExecuteActionCommand = (options: ExecuteActionCommandDefinition): CommandDefinition => {
    return {...options, name: CommandExecuteActionName};
}

export const defineContentScript = (options: ContentScriptDefinition): ContentScriptDefinition => {
    return options;
}

export const defineContentScriptAppend = (options: ContentScriptAppendDefinition): ContentScriptDefinition => {
    const {append, ...definition} = options;

    return {
        ...definition,
        mount: contentScriptMountAppendResolver(append),
    };
}

export const definePage = (options: PageDefinition): PageDefinition => {
    return options;
};

export const defineService = <T extends ServiceType>(options: ServiceDefinition<T>): ServiceDefinition<T> => {
    return options;
}