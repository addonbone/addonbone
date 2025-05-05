import get from "get-value";

export const RelayGlobalKey = 'adnbnRelay';

export type RelayType = ((...args: any[]) => Promise<any>) | { [key: string]: any | RelayType };

export interface RelayDictionary {
    [key: string]: any;
}

export type RelayName = Extract<keyof RelayDictionary, string>;

export type PropertyOptions = {
    path?: string,
    args?: any[],
    getOptions?: get.Options,
}

export interface RelayManager {
    property(name: RelayName, options: PropertyOptions): Promise<any>;

    add<K extends RelayName>(
        name: K,
        relay: RelayDictionary[K]
    ): this;

    get<K extends RelayName>(
        name: K
    ): RelayDictionary[K] | undefined;

    has(name: RelayName): boolean;

    remove<K extends RelayName>(
        name: K
    ): RelayDictionary[K] | undefined;

    clear(): this;
}

