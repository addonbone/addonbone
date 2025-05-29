import {RegisterTransport} from "@transport"

import OffscreenMessage from "../OffscreenMessage";
import OffscreenManager from "../OffscreenManager";

import type {TransportDictionary, TransportName} from "@typing/transport";

export default class<
    N extends TransportName,
    T extends object = TransportDictionary[N],
    A extends any[] = []
> extends RegisterTransport<N, T, A> {
    constructor(name: N, protected readonly init: (...args: A) => T) {
        super(name, init)
    }

    protected message() {
        return new OffscreenMessage(this.name);
    }

    protected manager() {
        return OffscreenManager.getInstance();
    }
}
