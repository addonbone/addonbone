import TransportMessage from "@transport/TransportMessage";

import {MessageTypeSeparator} from "@typing/message";

export default class ServiceMessage extends TransportMessage {
    protected readonly key: string;

    constructor(name: string) {
        super();
        this.key = `service${MessageTypeSeparator}${name}`;
    }
}
