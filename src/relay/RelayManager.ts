import get from 'get-value'

import TransportManager from '@transport/TransportManager';

import {TransportManager as TransportManagerContract, TransportName} from "@typing/transport";
import {RelayGlobalKey} from "@typing/relay";

type PropertyOptions = {
    path?: string,
    args?: any[],
    getOptions?: get.Options,
}

export default class RelayManager extends TransportManager {
    public static getInstance(): TransportManagerContract {
        return globalThis[RelayGlobalKey] ??= new RelayManager();
    }

    public async property(
        name: TransportName,
        options?: PropertyOptions
    ): Promise<any> {
        const {path, args, getOptions} = options || {};
        const relay = this.get(name)

        const property = path == null ? relay : get(relay, path, getOptions)

        if (property === undefined) {
            throw new Error(`Property not found at path "${path}" in relay "${name}"`)
        }

        if (typeof property === 'function') {
            return await property.apply(relay, args);
        }

        return property
    }
}
