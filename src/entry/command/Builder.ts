import {onActionClicked} from "@browser/action";
import {onCommand} from "@browser/command";

import {isValidCommandExecuteFunction, isValidCommandName} from "./resolvers";

import {
    CommandBuilder,
    CommandResolvedDefinition,
    CommandUnresolvedDefinition,
    EXECUTE_ACTION_COMMAND_NAME
} from "@typing/command";

type Tab = chrome.tabs.Tab;

export default class implements CommandBuilder {
    protected readonly definition: CommandResolvedDefinition;

    protected unsubscribe?: () => void;

    public constructor(definition: CommandUnresolvedDefinition) {
        const {name, execute} = definition;

        if (!isValidCommandExecuteFunction(execute)) {
            throw new Error('The command entrypoint must export a execute function');
        }

        if (!isValidCommandName(name)) {
            throw new Error('The command entrypoint must export a name string');
        }

        this.definition = {...definition, name, execute};
    }

    public async build(): Promise<void> {
        const {name} = this.definition;

        if (name == EXECUTE_ACTION_COMMAND_NAME) {
            this.unsubscribe = onActionClicked((tab) => {
                this.handle(tab);
            });

            return;
        }

        this.unsubscribe = onCommand((command, tab) => {
            if (command === name) {
                this.handle(tab);
            }
        });
    }

    public async destroy(): Promise<void> {
        this.unsubscribe?.();
    }

    protected handle(tab?: Tab): void {
        const {name, execute, ...options} = this.definition;

        try {
            Promise.resolve(execute({name, ...options}, tab)).catch((e) => {
                console.error('The command execute async function crashed:', e);
            });
        } catch (e) {
            console.error('The command execute function crashed:', e);
        }
    }
}