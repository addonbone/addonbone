import {FileBuilder} from "../../../typescript";

import template from "./service.d.ts?raw";
import {ReadonlyConfig} from "@typing/config";

export default class<T extends Record<string, string> = Record<string, string>> extends FileBuilder {
    protected _dictionary?: T;

    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    protected filename(): string {
        return "service.d.ts";
    }

    protected template(): string {
        const dictionary = this._dictionary;

        if (!dictionary) {
            throw new Error("Service dictionary is not set");
        }

        const type = Object.entries(dictionary).map(([key, value]) => {
            return `'${key}': ${value};`;
        }).join('\n\t\t');

        return template.replace('interface ServiceRegistry { [name: string]: any }', `interface ServiceRegistry {\n\t\t${type}\n\t}`);
    }

    public dictionary(dictionary: T): this {
        this._dictionary = dictionary;

        return this;
    }
}