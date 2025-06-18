import {TransportDeclaration, TransportDeclarationLayer} from "../typescript";

import {ReadonlyConfig} from "@typing/config";

export default class extends TransportDeclaration {
    constructor(config: ReadonlyConfig) {
        super(config, TransportDeclarationLayer.Relay);
    }

    protected template(): string {
        return super.template()
            .replace('RelayProxyTarget, RelayTarget', 'RelayProxyTarget, RelayTarget, ProxyRelayOptions')
            .replace('(name: N): RelayProxyTarget', '(name: N, options: ProxyRelayOptions): RelayProxyTarget');
    }
}