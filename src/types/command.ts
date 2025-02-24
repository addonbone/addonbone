import {EntrypointFile, EntrypointOptions} from "@typing/entrypoint";
import {Optional} from "utility-types";

type Tab = chrome.tabs.Tab;

export interface CommandConfig {
    name: string;
    description?: string;
    global?: boolean;
    defaultKey?: string;
    windowsKey?: string;
    macKey?: string;
    chromeosKey?: string;
    linuxKey?: string;
}

export type CommandOptions = CommandConfig & EntrypointOptions;

export type CommandEntrypointOptions = Optional<CommandOptions>;

export interface CommandDefinition extends CommandEntrypointOptions {
    main(options: CommandOptions, tab?: Tab): any;
}

export type CommandEntrypointMap = Map<EntrypointFile, CommandOptions>;