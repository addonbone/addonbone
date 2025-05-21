import FileBuilder from "./FileBuilder";

import {ReadonlyConfig} from "@typing/config";

export default class extends FileBuilder {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    protected filename(): string {
        return "vendor.d.ts";
    }

    protected template(): string {
        const types = [`:package/client-types`].map((value) => `/// <reference types="${value}" />`);

        return types.join('\n');
    }
}