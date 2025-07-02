import AbstractBuilder from "@entry/transport/AbstractBuilder";

import {RegisterRelay} from "@relay/providers";

import {RelayOptions, RelayUnresolvedDefinition} from "@typing/relay";
import {TransportName, TransportType} from "@typing/transport";

export default class<T extends TransportType = TransportType> extends AbstractBuilder<RelayOptions, T> {
    constructor(definition: RelayUnresolvedDefinition<T>) {
        const {main, ...options} = definition;

        super(options);
    }

    protected transport(): RegisterRelay<TransportName, T, [RelayOptions]> {
        const {name, init} = this.definition;

        return new RegisterRelay(name, init);
    }
}
