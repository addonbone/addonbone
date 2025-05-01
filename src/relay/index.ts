import ProxyRelay from "./ProxyRelay";
import BaseRelay from "./BaseRelay";

export {default as ProxyRelay} from './ProxyRelay'
export {default as RegisterRelay} from "./RegisterRelay";

export const getRelay = <T extends object>(name: string, tabId: number, frameId?: number) => {
    return new ProxyRelay<T>(name).getProxy(tabId, frameId);
}

export const getRegisteredRelay = <T extends object>(name: string) => {
    return new BaseRelay<T>(name).getOrigin();
}

