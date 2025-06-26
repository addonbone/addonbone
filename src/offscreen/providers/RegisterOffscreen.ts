import RegisterTransport from "@transport/RegisterTransport";

import {isOffscreen} from "@offscreen/utils";

import OffscreenMessage from "../OffscreenMessage";
import OffscreenManager from "../OffscreenManager";

import type {TransportDictionary, TransportName} from "@typing/transport";

export default class<
    N extends TransportName,
    T extends object = TransportDictionary[N],
    A extends any[] = []
> extends RegisterTransport<N, T, A> {
    constructor(name: N, protected readonly init: (...args: A) => T) {
        super(name, init);
    }

    protected message() {
        return new OffscreenMessage(this.name);
    }

    protected manager() {
        return OffscreenManager.getInstance();
    }

    public get(): T {
        if (!isOffscreen()) {
            throw new Error(`Offscreen service "${this.name}" can be getting only from offscreen context.`);
        }

        return super.get();
    }
}
