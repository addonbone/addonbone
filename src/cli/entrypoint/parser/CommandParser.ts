import {z} from "zod";

import BackgroundParser from "./BackgroundParser";

import {modifyLocaleMessageKey} from "@locale/utils";

import {CommandEntrypointOptions} from "@typing/command";
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
        const options = super.options(file);

        return {
            ...options,
            description: modifyLocaleMessageKey(options.description),
        };
    }
}