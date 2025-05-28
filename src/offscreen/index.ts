import {Offscreen, ProxyOffscreen, RegisterOffscreen} from './providers'

import {
    TransportDictionary,
    TransportName,
    TransportProxyTarget as OffscreenProxyTarget,
    TransportTarget as OffscreenTarget
} from "@typing/transport";

export {
    type OffscreenTarget,
    type OffscreenProxyTarget,

    ProxyOffscreen,
    RegisterOffscreen
};

export const getOffscreen = <N extends TransportName>(name: N): TransportDictionary[N] => {
    return new Offscreen<N>(name).get();
}

