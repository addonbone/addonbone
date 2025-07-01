import {Offscreen, ProxyOffscreen, RegisterOffscreen} from './providers';
import OffscreenBackground from './OffscreenBackground';

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
    RegisterOffscreen,
    OffscreenBackground,
};

export const getOffscreen = <N extends TransportName>(name: N): TransportDictionary[N] => {
    return new Offscreen<N>(name).get();
};

