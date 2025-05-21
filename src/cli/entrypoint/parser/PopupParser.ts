import {z} from "zod";

import ViewParser from "./ViewParser";

import {PageEntrypointOptions} from "@typing/page";

export default class extends ViewParser<PageEntrypointOptions> {
    protected definition(): string {
        return 'definePopup';
    }

    protected schema(): typeof this.CommonPropertiesSchema {
        return super.schema().extend({
            icon: z.string().nonempty().optional(),
            apply: z.boolean().optional(),
        });
    }
}