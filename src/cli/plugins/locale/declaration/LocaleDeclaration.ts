import {FileBuilder} from "@cli/plugins/typescript";

import {ReadonlyConfig} from "@typing/config";
import {LocaleStructure} from "@typing/locale";

export default class extends FileBuilder {
    protected _structure?: LocaleStructure;

    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    protected filename(): string {
        return "locale.d.ts";
    }

    protected url(): string {
        return import.meta.url;
    }

    protected template(): string {
        const structure = this._structure;

        if (!structure) {
            throw new Error("Locale structure is not set");
        }

        const type = JSON.stringify(structure, null, 4);

        const name = "GeneratedNativeStructure";

        return this.readFile().replace(`interface ${name} {}`, `interface ${name} ${type}`);
    }

    public structure(structure: LocaleStructure): this {
        this._structure = structure;

        return this;
    }
}
