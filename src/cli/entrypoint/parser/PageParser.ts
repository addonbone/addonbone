import {z} from "zod";

import ViewParser from "./ViewParser";

import {modifyLocaleMessageKey} from "@locale/utils";

import {PageEntrypointOptions} from "@typing/page";
import {EntrypointFile} from "@typing/entrypoint";

export default class extends ViewParser<PageEntrypointOptions> {
    protected definition(): string {
        return 'definePage';
    }

    protected schema(): typeof this.CommonPropertiesSchema {
        return super.schema().extend({
            name: z.string().nonempty().optional(),
        });
    }

    public options(file: EntrypointFile): PageEntrypointOptions {
        const options = super.options(file);

        return {
            ...options,
            title: modifyLocaleMessageKey(options.title),
        };
    }
}