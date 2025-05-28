import {TransportMessage} from '@transport'

export default class OffscreenMessage extends TransportMessage {
    protected readonly key: string;

    constructor(name: string) {
        super()
        this.key = `offscreen.${name}`;
    }
}
