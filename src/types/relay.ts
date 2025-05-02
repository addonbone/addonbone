import {DeepAsyncProxy} from "@typing/helpers";

export const RelayWindowKey = '__relay';

export type RelayType = ((...args: any[]) => Promise<any>) | { [key: string]: any | RelayType };

export type ProxyRelay<T> = DeepAsyncProxy<T>
