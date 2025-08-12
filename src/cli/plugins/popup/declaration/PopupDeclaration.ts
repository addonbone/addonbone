import {FileBuilder} from "@cli/plugins/typescript";

import {ReadonlyConfig} from "@typing/config";

export default class extends FileBuilder {
    protected alias = new Set<string>();

    constructor(config: ReadonlyConfig) {
        super(config);
    }

    protected filename(): string {
        return "popup.d.ts";
    }

    protected url(): string {
        return import.meta.url;
    }

    protected template(): string {
        let content = this.readFile();

        if (this.alias.size > 0) {
            const type = '"' + Array.from(this.alias).join('" | "') + '"';

            content = content.replace("type PopupAlias = string", `type PopupAlias = ${type}`);
        }

        return content;
    }

    public setAlias(alias: Set<string>): this {
        this.alias = alias;

        return this;
    }
}
