import Relay from "./Relay";

import type {TransportDictionary, TransportName} from "@typing/transport";

export default class<
    N extends TransportName,
    T extends object = TransportDictionary[N],
    A extends any[] = []
> extends Relay<N, T> {
    constructor(name: N, protected readonly init: (...args: A) => T) {
        super(name)
    }

    public register(...args: A): T {
        if (this.manager().has(this.name)) {
            throw new Error(`A relay with the name "${this.name}" already exists. The relay name must be unique.`);
        }

        const relay = this.init(...args)

        this.manager().add(this.name, relay)

        return relay;
    }
}
