import TransportMessage from "@transport/TransportMessage";

export default class OffscreenMessage extends TransportMessage {
    protected readonly key: string;

    constructor(name: string) {
        super();

        this.key = `offscreen:${name}`;
    }
}
