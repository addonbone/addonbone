import {ProxyService} from "@service/providers";

import {DeepAsyncProxy} from "@typing/helpers";
import {TransportDictionary, TransportType} from "@typing/transport";
import {ServiceDefinition} from "@typing/service";

export type {ServiceDefinition};

export const defineService = <T extends TransportType>(options: ServiceDefinition<T>): ServiceDefinition<T> => {
    return options;
};

export const getService = <N extends Extract<keyof TransportDictionary, string>>(
    name: N
): DeepAsyncProxy<TransportDictionary[N]> => {
    return new ProxyService(name).get();
};
