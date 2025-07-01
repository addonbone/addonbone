import {z} from "zod";

import ViewParser from "./ViewParser";

import {SidebarEntrypointOptions} from "@typing/sidebar";

export default class extends ViewParser<SidebarEntrypointOptions> {
    protected definition(): string {
        return "defineSidebar";
    }

    protected schema(): typeof this.CommonPropertiesSchema {
        return super.schema().extend({
            icon: z.string().nonempty().optional(),
            apply: z.boolean().optional(),
        });
    }
}
