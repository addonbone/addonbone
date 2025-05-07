import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type Command = chrome.commands.Command;

const commands = () => browser().commands as typeof chrome.commands;

// Methods
export const getAllCommands = (): Promise<Command[]> => new Promise<Command[]>((resolve, reject) => {
    commands().getAll((commands) => {
        try {
            throwRuntimeError();

            resolve(commands);
        } catch (e) {
            reject(e);
        }
    });
});


// Custom Methods
export const isSupportCommands = (): boolean => !!commands();


// Events
export const onCommand = (callback: Parameters<typeof chrome.commands.onCommand.addListener>[0]): () => void => {
    return handleListener(commands().onCommand, callback)
}
