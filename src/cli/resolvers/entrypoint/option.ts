import {z} from "zod";

import {OptionFile} from "../../parsers/entrypoint";

import {BackgroundEntrypointOptions} from "@typing/background";
import {CommandEntrypointOptions} from "@typing/command";
import {Browser} from "@typing/browser";

const CommonPropertiesSchema = z.object({
    includeApp: z.array(z.string()).optional(),
    excludeApp: z.array(z.string()).optional(),
    includeBrowser: z.array(z.nativeEnum(Browser)).optional(),
    excludeBrowser: z.array(z.nativeEnum(Browser)).optional(),
});

const parseOptions = <T extends typeof CommonPropertiesSchema>(file: string, schema: T, definition: string) => {
    const options = OptionFile.make(file)
        .setProperties(Object.keys(schema.shape))
        .setDefinition(definition)
        .getOptions();

    const {success, error, data} = schema.safeParse(options);

    if (!success) {
        const e = error?.errors[0];

        throw new Error(`Invalid options ${e.path.join(', ')} in "${file}": ${e.message}`);
    }

    return data;
}

export const getBackgroundOptions = (file: string): BackgroundEntrypointOptions => {
    const BackgroundPropertiesSchema = CommonPropertiesSchema.extend({
        persistent: z.boolean().optional(),
    });

    return parseOptions(file, BackgroundPropertiesSchema, 'defineBackground');
}

export const getCommandOptions = (file: string): CommandEntrypointOptions => {
    const ShortcutKeySchema = z
        .string()
        .regex(/^(Ctrl|Command|MacCtrl|Alt|Option)(\+Shift)?\+[A-Z0-9]$/, 'Invalid shortcut key, expected format like: Ctrl+Shift+K or Command+Shift+P')
        .optional();

    const CommandPropertiesSchema = CommonPropertiesSchema.extend({
        name: z.string().nonempty().optional(),
        description: z.string().nonempty().optional(),
        global: z.boolean().optional(),
        defaultKey: ShortcutKeySchema,
        windowsKey: ShortcutKeySchema,
        macKey: ShortcutKeySchema,
        chromeosKey: ShortcutKeySchema,
        linuxKey: ShortcutKeySchema,
    });

    return parseOptions(file, CommandPropertiesSchema, 'defineCommand');
}