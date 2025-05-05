import FileBuilder from "./FileBuilder";

import {PackageName} from "@typing/app";
import {ReadonlyConfig} from "@typing/config";

export default class extends FileBuilder {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    protected filename(): string {
        return "vendor.d.ts";
    }

    protected content(): string {
        const types = [`${PackageName}/client-types`].map((value) => `/// <reference types="${value}" />`);

        return types.join('\n')
    }
}