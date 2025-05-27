import get from "get-value";

import {TransportManager, TransportName} from '@typing/transport'

export const RelayGlobalKey = 'adnbnRelay';

export type PropertyOptions = {
    path?: string,
    args?: any[],
    getOptions?: get.Options,
}

export interface RelayManager extends TransportManager {
    property(name: TransportName, options: PropertyOptions): Promise<any>;
}
