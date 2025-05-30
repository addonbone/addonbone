import get from "get-value";

export const RelayGlobalKey = 'adnbnRelay';

export type PropertyOptions = {
    path?: string,
    args?: any[],
    getOptions?: get.Options,
}
