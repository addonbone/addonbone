import OptionFile from "./OptionFile";

import {BackgroundEntrypointOptions} from "@typing/background";
import {BaseEntrypointOptions} from "@typing/base";

const commonProperties: Array<keyof BaseEntrypointOptions> = [
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