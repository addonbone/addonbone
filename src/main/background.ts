import {BackgroundConfig, BackgroundDefinition, BackgroundMainHandler} from "@typing/background";

export type {BackgroundConfig, BackgroundDefinition, BackgroundMainHandler};

export const defineBackground = (options: BackgroundDefinition): BackgroundDefinition => {
    return options;
}
