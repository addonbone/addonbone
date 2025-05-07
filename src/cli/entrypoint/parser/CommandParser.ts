import {z} from "zod";

import BackgroundParser from "./BackgroundParser";

import {modifyLocaleMessageKey} from "@locale/utils";

import {CommandEntrypointOptions, CommandExecuteActionName} from "@typing/command";
import {EntrypointFile} from "@typing/entrypoint";

export default class extends BackgroundParser<CommandEntrypointOptions> {
    protected definition(): string[] {
        return ['defineCommand', 'defineExecuteActionCommand'];
    }

    protected schema(): typeof this.CommonPropertiesSchema {
        const ShortcutKeySchema = z
            .string()
            .regex(/^(Ctrl|Command|MacCtrl|Alt|Option)(\+Shift)?\+[A-Z0-9]$/, 'Invalid shortcut key, expected format like: Ctrl+Shift+K or Command+Shift+P')
            .optional();

        return super.schema().extend({
            name: z.string().nonempty().optional(),
            description: z.string().nonempty().optional(),
            global: z.boolean().optional(),
            defaultKey: ShortcutKeySchema,
            windowsKey: ShortcutKeySchema,
            macKey: ShortcutKeySchema,
            chromeosKey: ShortcutKeySchema,
            linuxKey: ShortcutKeySchema,
        });
    }

    public options(file: EntrypointFile): CommandEntrypointOptions {
        const {defaultKey, windowsKey, macKey, chromeosKey, linuxKey, ...options} = super.options(file);

        if (!defaultKey && !windowsKey && !macKey && !chromeosKey && !linuxKey) {
            throw new Error("Invalid command options: At least one suggested key must be defined");
        }

        return {
            ...options,
            defaultKey,
            windowsKey,
            macKey,
            chromeosKey,
            linuxKey,
            description: modifyLocaleMessageKey(options.description),
        };
    }

    protected getOptions(file: EntrypointFile): Record<string, any> {
        const instance = this.optionFile(file);

        const options = instance.getOptions();

        if (instance.getDefinition() === 'defineExecuteActionCommand') {
            return {...options, name: CommandExecuteActionName};
        }

        return options;
    }
}