import {TransportManager} from '@transport'

import {OffscreenGlobalKey} from "@typing/offscreen";

import type {TransportManager as TransportManagerContract} from "@typing/transport";

export default class OffscreenManager extends TransportManager {
    public static getInstance(): TransportManagerContract {
        return globalThis[OffscreenGlobalKey] ??= new OffscreenManager();
    }
}
