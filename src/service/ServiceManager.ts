import {TransportManager} from '@transport'

import {ServiceGlobalKey} from "@typing/service";

import type {TransportManager as TransportManagerContract} from "@typing/transport";

export default class ServiceManager extends TransportManager {
    public static getInstance(): TransportManagerContract {
        return globalThis[ServiceGlobalKey] ??= new ServiceManager();
    }
}
