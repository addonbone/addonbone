import OptionFile from "./OptionFile";

import {BackgroundEntrypointOptions} from "@typing/background";
import {EntrypointOptions} from "@typing/entrypoint";

const commonProperties: Array<keyof EntrypointOptions> = [
    'includeApp',
    'excludeApp',
    'includeBrowser',
    'excludeBrowser',
];

export const getBackgroundOptions = (file: string): BackgroundEntrypointOptions => {
    return OptionFile.make(file)
        .setDefinition('defineBackground')
        .setProperties([...commonProperties, 'persistent'])
        .getOptions();
}