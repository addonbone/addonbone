import get from 'get-value';

import OffscreenMessage from "../OffscreenMessage";
import Offscreen from "./Offscreen";

import type {TransportDictionary, TransportMessage, TransportName} from "@typing/transport";

export default class<
    N extends TransportName,
    T extends object = TransportDictionary[N],
    A extends any[] = []
> extends Offscreen<N, T> {
    protected message: TransportMessage

    constructor(name: N, protected readonly init: (...args: A) => T) {
        super(name)
        this.message = new OffscreenMessage(name);
    }

    public register(...args: A): T {
        if (this.manager().has(this.name)) {
            throw new Error(`A offscreen service with the name "${this.name}" already exists. The offscreen service name must be unique.`);
        }

        const service = this.init(...args);

        this.manager().add(this.name, service);

        this.message.watch(async ({path, args}) => {
            try {
                const property = path == null ? service : get(service, path);

                if (property === undefined) {
                    throw new Error(`Property not found at path "${path}" in offscreen service "${this.name}"`);
                }

                if (typeof property === 'function') {
                    return await property.apply(service, args);
                }

                return property

            } catch (error) {
                console.error('RegisterOffscreen.register()', error);

                throw error;
            }
        });

        return service;
    }
}
