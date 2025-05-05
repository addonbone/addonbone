import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "@browser/runtime";

type Command = chrome.commands.Command;

const commands = () => browser().commands;

export const isSupportCommands = (): boolean => !!commands;

export const getAllCommands = () => new Promise<Command[]>((resolve, reject) => {
    commands().getAll((commands) => {
        try {
            throwRuntimeError();

            resolve(commands);
        } catch (e) {
            reject(e);
        }
    });
});

export const onCommand = (callback: Parameters<typeof chrome.commands.onCommand.addListener>[0]): () => void => {
    return handleListener(commands().onCommand, callback)
}
