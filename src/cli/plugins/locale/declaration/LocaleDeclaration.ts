import template from "./locale.d.ts?raw";

import {FileBuilder} from "@cli/plugins/typescript";

import {PackageName} from "@typing/app";
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

    protected content(): string {
        const structure = this._structure;

        if (!structure) {
            throw new Error("Locale structure is not set");
        }

        const type = JSON.stringify(structure, null, 4);

        return template
            .replaceAll(':package', PackageName)
            .replace('interface LocaleNativeStructure {}', `interface LocaleNativeStructure ${type}`);
    }

    public structure(structure: LocaleStructure): this {
        this._structure = structure;

        return this;
    }
}