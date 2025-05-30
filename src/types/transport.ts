import {EntrypointOptions} from "@typing/entrypoint";
import {DeepAsyncProxy} from "@typing/helpers";

export type TransportType = ((...args: any[]) => Promise<any>) | { [key: string]: any | TransportType };

export interface TransportDictionary {
    [key: string]: any;
}

export type TransportName = Extract<keyof TransportDictionary, string>;

export type TransportTarget<T extends TransportDictionary, K extends keyof T> = T[K];

export type TransportProxyTarget<T extends TransportDictionary, K extends keyof T> = DeepAsyncProxy<T[K]>;

export interface TransportManager {
    add<K extends TransportName>(
        name: K,
        instance: TransportDictionary[K]
    ): this;

    get<K extends TransportName>(
        name: K
    ): TransportDictionary[K] | undefined;

    has(name: TransportName): boolean;

    remove<K extends TransportName>(
        name: K
    ): TransportDictionary[K] | undefined;

    clear(): this;
}

export type TransportMessageData = { path?: string, args: any[] }

export interface TransportMessage {
    send(data: TransportMessageData): any;

    watch(handler: (data: TransportMessageData) => any): void
}

export interface TransportConfig {
    name: string;
}

export type TransportOptions = TransportConfig & EntrypointOptions;

export type TransportEntrypointOptions = Partial<TransportOptions>;