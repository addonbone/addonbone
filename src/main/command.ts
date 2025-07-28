import {
    CommandConfig,
    CommandDefinition,
    CommandExecute,
    CommandExecuteActionName,
    CommandUnresolvedDefinition,
    ExecuteActionCommandDefinition,
} from "@typing/command";

export {
    type CommandDefinition,
    type CommandUnresolvedDefinition,
    type ExecuteActionCommandDefinition,
    CommandExecuteActionName,
    type CommandConfig,
    type CommandExecute,
};

export const defineCommand = (options: CommandDefinition): CommandDefinition => {
    return options;
};

export const defineExecuteActionCommand = (options: ExecuteActionCommandDefinition): CommandDefinition => {
    return {...options, name: CommandExecuteActionName};
};
