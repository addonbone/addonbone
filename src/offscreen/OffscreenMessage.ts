import TransportMessage from "@transport/TransportMessage";

import {MessageTypeSeparator} from "@typing/message";

export default class OffscreenMessage extends TransportMessage {
    protected readonly key: string;

    constructor(name: string) {
        super();

        this.key = `offscreen${MessageTypeSeparator}${name}`;
    }
}
