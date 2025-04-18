import {z} from "zod";

import {OptionFile} from "./drivers";

import {Browser} from "@typing/browser";
import {EntrypointFile, EntrypointOptions, EntrypointParser} from "@typing/entrypoint";

export default abstract class AbstractParser<O extends EntrypointOptions> implements EntrypointParser<O> {
    protected readonly CommonPropertiesSchema = z.object({
        includeApp: z.array(z.string()).optional(),
        excludeApp: z.array(z.string()).optional(),
        includeBrowser: z.array(z.nativeEnum(Browser)).optional(),
        excludeBrowser: z.array(z.nativeEnum(Browser)).optional(),
    });

    protected abstract schema(): typeof this.CommonPropertiesSchema;

    protected abstract definition(): string | string[];

    public options(file: EntrypointFile): O {
        const schema = this.schema();

        const options = OptionFile.make(file.file)
            .setProperties(Object.keys(schema.shape))
            .setDefinition(this.definition())
            .getOptions();

        const {success, error, data} = schema.safeParse(options);

        if (!success) {
            const e = error?.errors[0];

            if (e) {
                throw new Error(`Invalid options ${e.path.join(', ')} in "${file.file}": ${e.message}`);
            } else {
                throw new Error(`Invalid options in "${file.file}"`);
            }
        }

        return (data || {}) as O;
    }
}