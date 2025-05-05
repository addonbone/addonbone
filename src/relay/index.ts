import {BaseRelay, ProxyRelay, RegisterRelay} from "./providers";

import type {RelayDictionary, RelayName} from "@typing/relay";

export {type RelayDictionary, RegisterRelay, ProxyRelay}

export const getRelay = <N extends RelayName>(name: N): RelayDictionary[N] => {
    return new BaseRelay<N>(name).get();
}
