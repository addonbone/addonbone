import {z} from "zod";

import AbstractParser from "./AbstractParser";

import {BackgroundEntrypointOptions} from "@typing/background";

export default class<T extends BackgroundEntrypointOptions = BackgroundEntrypointOptions> extends AbstractParser<T> {
    protected definition(): string | string[] {
        return 'defineBackground';
    }

    protected schema(): typeof this.CommonPropertiesSchema {
        return this.CommonPropertiesSchema.extend({
            persistent: z.boolean().optional(),
        });
    }
}