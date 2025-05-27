import {executeScript, isAvailableScripting} from "@browser/scripting";
import {ProxyTransport} from "@transport";

import RelayManager from "../RelayManager";

import {RelayGlobalKey, RelayManager as RelayManagerContract} from "@typing/relay";
import type {DeepAsyncProxy} from "@typing/helpers";
import type {TransportDictionary, TransportName} from "@typing/transport";

type InjectionTarget = chrome.scripting.InjectionTarget;

export default class ProxyRelay<N extends TransportName, T = DeepAsyncProxy<TransportDictionary[N]>> extends ProxyTransport<N, T> {
    constructor(name: N, protected options: number | InjectionTarget) {
        super(name);
    }

    protected manager(): RelayManagerContract {
        return RelayManager.getInstance();
    }

    protected async apply(args: any[], path?: string): Promise<any> {
        const target = typeof this.options === 'number' ? {tabId: this.options} : this.options;

        const result = await executeScript({
            target,

            func: async (name: string, path: string, args: any[], key: string) => {
                try {
                    return await globalThis[key].property(name, {path, args})
                } catch (error) {
                    console.error('ProxyRelay.createProxy()', error)
                    throw error
                }
            },

            args: [this.name, path!, args, RelayGlobalKey],
        });

        return result?.[0]?.result;
    }

    public get(): T {
        if (!isAvailableScripting()) {
            throw new Error(`You are trying to get proxy relay "${this.name}" from script content. You can get original relay instead`);
        }

        return super.get()
    }
}
