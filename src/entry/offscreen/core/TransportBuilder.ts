import AbstractBuilder from "@entry/transport/AbstractBuilder";

import {RegisterOffscreen} from "@offscreen/providers";

import {OffscreenOptions, OffscreenUnresolvedDefinition} from "@typing/offscreen";
import {TransportName, TransportType} from "@typing/transport";

export default class<T extends TransportType = TransportType> extends AbstractBuilder<OffscreenOptions, T> {
    constructor(definition: OffscreenUnresolvedDefinition<T>) {
        super(definition);
    }

    protected transport(): RegisterOffscreen<TransportName, T, [OffscreenOptions]> {
        const {name, init} = this.definition;

        return new RegisterOffscreen(name, init);
    }
}