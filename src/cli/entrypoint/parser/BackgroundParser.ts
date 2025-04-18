import {z} from "zod";

import AbstractParser from "./AbstractParser";

import {BackgroundEntrypointOptions} from "@typing/background";

export default class extends AbstractParser<BackgroundEntrypointOptions> {
    protected definition(): string {
        return 'defineBackground';
    }

    protected schema(): typeof this.CommonPropertiesSchema {
        return this.CommonPropertiesSchema.extend({
            persistent: z.boolean().optional(),
        });
    }
}