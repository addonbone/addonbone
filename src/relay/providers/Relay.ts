import {isAvailableScripting} from "@browser/scripting";
import {BaseTransport} from "@transport";

import {TransportDictionary, TransportName} from "@typing/transport";
import {RelayManager as RelayManagerContract} from "@typing/relay";

import RelayManager from "../RelayManager";

export default class<N extends TransportName, T = TransportDictionary[N]> extends BaseTransport<N, T> {
    constructor(name: N) {
        super(name);
    }

    protected manager(): RelayManagerContract {
        return RelayManager.getInstance();
    }

    public get(): T {
        if (isAvailableScripting()) {
            throw new Error(`Relay "${this.name}" can be getting only from content script`);
        }

        return super.get()
    }

}
