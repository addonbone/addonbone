import {FileBuilder} from "@cli/plugins/typescript";

import {ReadonlyConfig} from "@typing/config";

export default class extends FileBuilder {
    protected names = new Set<string>();

    constructor(config: ReadonlyConfig) {
        super(config);
    }

    protected filename(): string {
        return "icon.d.ts";
    }

    protected url(): string {
        return import.meta.url;
    }

    protected template(): string {
        let content = this.readFile();

        if (this.names.size > 0) {
            const type = '"' + Array.from(this.names).join('" | "') + '"';

            content = content.replace("type IconName = string", `type IconName = ${type}`);
        }

        return content;
    }

    public setNames(names: Set<string>): this {
        this.names = names;

        return this;
    }
}
