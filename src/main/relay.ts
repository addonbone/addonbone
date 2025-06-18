import {ProxyRelay, type ProxyRelayOptions} from "@relay/providers";

import {DeepAsyncProxy} from "@typing/helpers";
import {TransportDictionary, TransportType} from "@typing/transport";
import {RelayDefinition, RelayUnresolvedDefinition} from "@typing/relay";

export type {RelayDefinition, RelayUnresolvedDefinition};

export const defineRelay = <T extends TransportType>(options: RelayDefinition<T>): RelayDefinition<T> => {
    return options;
}

export const getRelay = <
    N extends Extract<keyof TransportDictionary, string>
>(name: N, options: ProxyRelayOptions): DeepAsyncProxy<TransportDictionary[N]> => {
    return new ProxyRelay(name, options).get();
}