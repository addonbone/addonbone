import {contentScriptMountAppendResolver} from "@entry/content";

import {ConfigDefinition} from "@typing/config";
import {BackgroundDefinition} from "@typing/background";
import {ContentScriptAppendDefinition, ContentScriptDefinition} from "@typing/content";
import {PluginDefinition} from "@typing/plugin";
import {CommandDefinition, EXECUTE_ACTION_COMMAND_NAME, ExecuteActionCommandDefinition} from "@typing/command";

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
    return {...options, name: EXECUTE_ACTION_COMMAND_NAME};
}

export const defineContentScript = (options: ContentScriptDefinition): ContentScriptDefinition => {
    return options;
}

export const defineContentScriptAppend = (options: ContentScriptAppendDefinition): ContentScriptDefinition => {
    return {
        ...options,
        mount: contentScriptMountAppendResolver(options.append),
    };
}