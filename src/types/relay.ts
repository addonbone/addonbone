import {DeepAsyncProxy} from "@typing/helpers";

export const WindowRelayManager = '__relay_manager';

export type RelayType = ((...args: any[]) => Promise<any>) | { [key: string]: any | RelayType };

export type ProxyRelay<T> = DeepAsyncProxy<T>
