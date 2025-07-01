import {CommandDefinition, CommandExecute} from "@typing/command";

export const isValidCommandDefinition = (definition: any): definition is CommandDefinition => {
    return definition && typeof definition === "object" && definition.constructor === Object;
};

export const isValidCommandExecuteFunction = (execute: any): execute is CommandExecute => {
    return execute && typeof execute === "function";
};

export const isValidCommandName = (name: any): name is string => {
    return name && typeof name === "string" && name.trim().length > 0;
};
