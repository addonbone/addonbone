import BaseRelay from "./BaseRelay";

import type {RelayDictionary, RelayName} from "@typing/relay";

export default class<
    N extends RelayName,
    T extends object = RelayDictionary[N],
    A extends any[] = []
> extends BaseRelay<N, T> {
    constructor(name: N, protected readonly init: (...args: A) => T) {
        super(name)
    }

    public register(...args: A) {
        if (this.manager.has(this.name)) {
            throw new Error(`A relay with the name "${this.name}" already exists. The relay name must be unique.`);
        }

        this.manager.add(this.name, this.init(...args))
    }
}
