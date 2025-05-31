import _ from 'lodash';

import FileBuilder from "../../FileBuilder";

import template from "./transport.d.ts?raw";

import {ReadonlyConfig} from "@typing/config";

export enum TransportDeclarationLayer {
    Service = 'service',
    Offscreen = 'offscreen',
    Relay = 'relay',
}

export default class<T extends Record<string, string> = Record<string, string>> extends FileBuilder {
    protected _dictionary?: T;

    constructor(
        config: ReadonlyConfig,
        protected readonly layer: TransportDeclarationLayer,
    ) {
        super(config);
    }

    protected filename(): string {
        return this.layer + '.d.ts';
    }

    protected template(): string {
        const dictionary = this._dictionary;

        if (!dictionary) {
            throw new Error(`Transport ${this.layer} dictionary is not set`);
        }

        const type = Object.entries(dictionary).map(([key, value]) => {
            return `'${key}': ${value};`;
        }).join('\n\t\t');

        return template
            .replaceAll(':layer', this.layer)
            .replaceAll('Layer', _.upperFirst(this.layer))
            .replace(`{ [name: string]: any }`, `{\n\t\t${type}\n\t}`);
    }

    public dictionary(dictionary: T): this {
        this._dictionary = dictionary;

        return this;
    }
}