import {EntrypointBuilder, EntrypointFile, EntrypointOptions} from "@typing/entrypoint";
import {Required} from "utility-types";

import {Awaiter} from "@typing/helpers";

type Tab = chrome.tabs.Tab;

export const CommandExecuteActionName = '_execute_action';

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

export type CommandEntrypointOptions = Partial<CommandOptions>;

export type CommandExecute = (tab: Tab | undefined, options: CommandOptions) => Awaiter<void>;

export interface CommandDefinition extends CommandEntrypointOptions {
    execute: CommandExecute;
}

export type ExecuteActionCommandDefinition = Omit<CommandDefinition, 'name'>;

export type CommandUnresolvedDefinition = Partial<CommandDefinition>;

export type CommandResolvedDefinition = Required<CommandDefinition, 'name' | 'execute'>;

export type CommandEntrypointMap = Map<EntrypointFile, CommandOptions>;

export type CommandBuilder = EntrypointBuilder;