import {OptionFile} from "../../parsers/entrypoint";

import {BackgroundEntrypointOptions} from "@typing/background";
import {EntrypointOptions} from "@typing/entrypoint";
import {CommandEntrypointOptions} from "@typing/command";

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

export const getCommandOptions = (file: string): CommandEntrypointOptions => {
    return OptionFile.make(file)
        .setDefinition('defineCommand')
        .setProperties([
            ...commonProperties,
            'name',
            'description',
            'global',
            'defaultKey',
            'windowsKey',
            'macKey',
            'chromeosKey',
            'linuxKey'
        ])
        .getOptions();
}