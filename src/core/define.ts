import {ConfigDefinition} from "@typing/config";
import {BackgroundDefinition} from "@typing/background";
import {ContentScriptDefinition} from "@typing/content";

export const defineConfig = (config: ConfigDefinition): ConfigDefinition => {
    return config;
}

export const defineBackground = (options: BackgroundDefinition): BackgroundDefinition => {
    return options;
}

export const defineContentScript = (options: ContentScriptDefinition): ContentScriptDefinition => {
    return options;
}