import {executeScript, isAvailableScripting} from "@browser/scripting";
import {ProxyTransport} from "@transport";

import RelayManager from "../RelayManager";

import {RelayGlobalKey} from "@typing/relay";

import type {DeepAsyncProxy} from "@typing/helpers";
import type {TransportDictionary, TransportManager, TransportName} from "@typing/transport";

type InjectionTarget = chrome.scripting.InjectionTarget;

export default class ProxyRelay<N extends TransportName, T = DeepAsyncProxy<TransportDictionary[N]>> extends ProxyTransport<N, T> {
    constructor(name: N, protected options: number | InjectionTarget) {
        super(name);
    }

    protected manager(): TransportManager {
        return RelayManager.getInstance();
    }

    protected async apply(args: any[], path?: string): Promise<any> {
        const result = await executeScript({
            target: typeof this.options === 'number' ? {tabId: this.options} : this.options,

            args: [this.name, path!, args, RelayGlobalKey],

            func: async (name: string, path: string, args: any[], key: string) => {
                try {
                    const awaitManager = async (maxAttempts = 10, delay = 300): Promise<RelayManager> => {
                        for (let count = 0; count < maxAttempts; count++) {
                            const manager = globalThis[key];

                            if (manager) return manager;

                            await new Promise((resolve) => setTimeout(resolve, delay));
                        }

                        throw new Error(`Relay manager not found after ${maxAttempts} attempts.`);
                    }

                    const manager: RelayManager = await awaitManager();

                    return await manager.property(name, {path, args});
                } catch (error) {
                    console.error('ProxyRelay.createProxy()', error)
                    throw error
                }
            },
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
