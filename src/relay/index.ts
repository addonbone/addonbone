import ProxyRelay from "./ProxyRelay";
import BaseRelay from "./BaseRelay";

import {RelayType} from "@typing/relay";

type InjectionTarget = chrome.scripting.InjectionTarget;

export {default as ProxyRelay} from './ProxyRelay'
export {default as RegisterRelay} from "./RegisterRelay";

export const getRelay = <T extends RelayType>(name: string, options: number | InjectionTarget) => {
    return new ProxyRelay<T>(name).get(options);
}

export const getRegisteredRelay = <T extends RelayType>(name: string) => {
    return new BaseRelay<T>(name).get();
}
