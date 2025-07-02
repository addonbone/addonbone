import {isAvailableScripting} from "@adnbn/browser";

import BaseTransport from "@transport/BaseTransport";

import {TransportDictionary, TransportManager, TransportName} from "@typing/transport";

import RelayManager from "../RelayManager";

export default class<N extends TransportName, T = TransportDictionary[N]> extends BaseTransport<N, T> {
    constructor(name: N) {
        super(name);
    }

    protected manager(): TransportManager {
        return RelayManager.getInstance();
    }

    public get(): T {
        if (isAvailableScripting()) {
            throw new Error(`Relay "${this.name}" can be getting only from content script`);
        }

        return super.get();
    }
}
