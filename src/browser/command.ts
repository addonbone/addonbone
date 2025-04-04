import {browser} from "./env";
import {throwRuntimeError} from "@browser/runtime";

type Command = chrome.commands.Command;

const commands = browser().commands;

export const isSupportCommands = (): boolean => !!commands;

export const getAllCommands = () => new Promise<Command[]>((resolve, reject) => {
    if (!isSupportCommands()) resolve([]);

    commands.getAll((commands) => {
        try {
            throwRuntimeError();

            resolve(commands);
        } catch (e) {
            reject(e);
        }
    });
});

export const onCommand = (callback: Parameters<typeof commands.onCommand.addListener>[0]): () => void => {
    if (!isSupportCommands()) return () => ({});

    commands.onCommand.addListener(callback);

    return () => commands.onCommand.removeListener(callback);
}
