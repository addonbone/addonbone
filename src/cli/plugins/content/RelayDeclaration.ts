import {TransportDeclaration, TransportDeclarationLayer} from "../typescript";

import {ReadonlyConfig} from "@typing/config";

export default class extends TransportDeclaration {
    constructor(config: ReadonlyConfig) {
        super(config, TransportDeclarationLayer.Relay);
    }

    protected template(): string {
        return super.template()
            .replace('(name: N): RelayProxyTarget', '(name: N, options: number | chrome.scripting.InjectionTarget): RelayProxyTarget');
    }
}