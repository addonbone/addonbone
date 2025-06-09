import {z} from "zod";

import ViewParser from "./ViewParser";

import {PopupEntrypointOptions} from "@typing/popup";

export default class extends ViewParser<PopupEntrypointOptions> {
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