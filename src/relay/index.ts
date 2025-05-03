import ProxyRelay from "./ProxyRelay";
import BaseRelay from "./BaseRelay";

import {RelayType} from "@typing/relay";

export {default as ProxyRelay} from './ProxyRelay'
export {default as RegisterRelay} from "./RegisterRelay";

export const getRelay = <T extends RelayType>(name: string, tabId: number, frameId?: number) => {
    return new ProxyRelay<T>(name).get(tabId, frameId);
}

export const getRegisteredRelay = <T extends RelayType>(name: string) => {
    return new BaseRelay<T>(name).get();
}

