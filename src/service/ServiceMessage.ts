import {TransportMessage} from '@transport'

export default class ServiceMessage extends TransportMessage {
    protected readonly key: string;

    constructor(name: string) {
        super()
        this.key = `service.${name}`;
    }
}
