import z from "zod";

import ViewParser from "./ViewParser";

import {PageEntrypointOptions} from "@typing/page";

export default class extends ViewParser<PageEntrypointOptions> {
    protected definition(): string {
        return 'definePage';
    }

    protected schema(): typeof this.CommonPropertiesSchema {
        return super.schema().extend({
            name: z.string().nonempty().optional(),
            matches: z.array(z.string()).optional(),
        });
    }
}