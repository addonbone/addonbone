import {BackgroundDefinition, BackgroundMainHandler} from "@typing/background";

export const isValidBackgroundDefinition = (definition: any): definition is BackgroundDefinition => {
    return definition && typeof definition === "object" && definition.constructor === Object;
};

export const isValidBackgroundMainHandler = (main: unknown): main is BackgroundMainHandler => {
    return typeof main === "function";
};
