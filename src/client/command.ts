import {CommandDefinition, EXECUTE_ACTION_COMMAND_NAME} from "@typing/command";
import {onActionClicked} from "@browser/action";
import {onCommand} from "@browser/command";

type Tab = chrome.tabs.Tab;

export const handleCommand = (definition: CommandDefinition): () => void => {
    const {name, execute, ...options} = definition;

    if (typeof execute !== 'function') {
        throw new Error('The command entrypoint must export a execute function');
    }

    if (typeof name !== 'string' || !name || name.trim().length === 0) {
        throw new Error('The command entrypoint must export a name string');
    }

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