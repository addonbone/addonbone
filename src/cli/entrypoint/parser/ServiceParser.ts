import z from "zod";

import BackgroundParser from "./BackgroundParser";

import {ServiceEntrypointOptions} from "@typing/service";

export default class extends BackgroundParser<ServiceEntrypointOptions> {
    protected definition(): string {
        return 'defineService';
    }

    protected schema(): typeof this.CommonPropertiesSchema {
        return super.schema().extend({
            name: z.string().nonempty().optional(),
        });
    }
}