import AbstractBuilder from "@entry/transport/AbstractBuilder";

import RegisterService from "@service/providers/RegisterService";

import {ServiceOptions, ServiceUnresolvedDefinition} from "@typing/service";
import {TransportName, TransportType} from "@typing/transport";

export default class<T extends TransportType = TransportType> extends AbstractBuilder<ServiceOptions, T> {
    constructor(definition: ServiceUnresolvedDefinition<T>) {
        super(definition);
    }

    protected transport(): RegisterService<TransportName, T, [ServiceOptions]> {
        const {name, init} = this.definition;

        return new RegisterService(name, init);
    }
}