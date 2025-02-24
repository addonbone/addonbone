import {browser} from "./env";

const commands = browser().commands;

export const onCommand = (callback: Parameters<typeof chrome.commands.onCommand.addListener>[0]): () => void => {
    commands.onCommand.addListener(callback);

    return () => commands.onCommand.removeListener(callback);
}