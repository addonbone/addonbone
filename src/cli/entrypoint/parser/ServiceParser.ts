import z from "zod";

import BackgroundParser from "./BackgroundParser";

import {ServiceEntrypointOptions} from "@typing/service";

export default class extends BackgroundParser<ServiceEntrypointOptions> {
    protected definition(): string {
        return "defineService";
    }

    protected agreement(): string {
        return "init";
    }

    protected schema(): typeof this.CommonPropertiesSchema {
        return super.schema().extend({
            name: z
                .string()
                .trim()
                .min(1)
                .max(100)
                .regex(/^[\p{L}_$][\p{L}\p{N}_$]*$/u, {
                    message:
                        "Key must start with a Unicode letter, `$` or `_`, and may only contain letters, digits, `$` or `_`",
                })
                .optional(),
        });
    }
}
