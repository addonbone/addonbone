import {ProxyService, RegisterService, Service} from "./providers";

import type {
    TransportDictionary,
    TransportName,
    TransportProxyTarget as ServiceProxyTarget,
    TransportTarget as ServiceTarget,
} from "@typing/transport";

export {type ServiceTarget, type ServiceProxyTarget, ProxyService, RegisterService};

export const getService = <N extends TransportName>(name: N): TransportDictionary[N] => {
    return new Service<N>(name).get();
};
