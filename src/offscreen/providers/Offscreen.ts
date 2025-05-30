import { isOffscreen} from "../utils";

import {BaseTransport} from "@transport";

import OffscreenManager from "../OffscreenManager";

import type {TransportDictionary, TransportName, TransportManager} from "@typing/transport";

export default class<N extends TransportName, T = TransportDictionary[N]> extends BaseTransport<N, T> {
    constructor(name: N) {
        super(name);
    }

    protected manager(): TransportManager {
        return OffscreenManager.getInstance();
    }

    public get(): T {
        if (!isOffscreen()) {
            throw new Error(`Offscreen service "${this.name}" can be getting only from offscreen context.`);
        }

        return super.get()
    }
}
