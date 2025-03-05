import {CommandEntrypointOptions, CommandExecute, EXECUTE_ACTION_COMMAND_NAME} from "@typing/command";
import {onActionClicked} from "@browser/action";
import {onCommand} from "@browser/command";

type Tab = chrome.tabs.Tab;

export const handleCommand = (name: string, execute: CommandExecute, options: CommandEntrypointOptions): () => void => {
    const handle = (tab?: Tab): void => {
        try {
            Promise.resolve(execute({name, ...options}, tab)).catch((e) => {
                console.error('The command execute async function crashed:', e);
            });
        } catch (e) {
            console.error('The command execute function crashed:', e);
        }
    }

    if (name == EXECUTE_ACTION_COMMAND_NAME) {
        return onActionClicked((tab) => {
            handle(tab);
        });
    }

    return onCommand((command, tab) => {
        if (command === name) {
            handle(tab);
        }
    });
};