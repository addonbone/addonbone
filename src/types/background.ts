import {BaseEntrypointOptions} from "@typing/base";

export interface BackgroundConfig {
    persistent?: boolean;
}

export type BackgroundEntrypointOptions = BackgroundConfig & BaseEntrypointOptions;

export type BackgroundDefinition = BackgroundEntrypointOptions;

export type BackgroundEntrypointMap = Map<string, BackgroundDefinition>;