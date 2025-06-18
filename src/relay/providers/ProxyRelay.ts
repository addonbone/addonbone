import {getInjectScript, GetInjectScriptOptions, InjectScript} from "@support";
import {getManifestVersion} from "@browser/runtime";
import {isAvailableScripting} from "@browser/scripting";
import {ProxyTransport} from "@transport";

import RelayManager from "../RelayManager";

import {RelayGlobalKey} from "@typing/relay";

import type {DeepAsyncProxy} from "@typing/helpers";
import type {TransportDictionary, TransportManager, TransportName} from "@typing/transport";

export type ProxyRelayOptions = number | Omit<GetInjectScriptOptions, 'frameId' | 'documentId' | 'timeFallback'> & {
    frameId?: number;
    documentId?: string
}

export default class ProxyRelay<
    N extends TransportName,
    T = DeepAsyncProxy<TransportDictionary[N]>
> extends ProxyTransport<N, T> {
    private injectScript: InjectScript;

    constructor(name: N, protected options: ProxyRelayOptions) {
        super(name);

        this.injectScript = getInjectScript({
            ...(typeof options === "number" ? {tabId: options} : options),
            timeFallback: 4000,
        })
    }

    protected manager(): TransportManager {
        return RelayManager.getInstance();
    }

    protected async apply(args: any[], path?: string): Promise<any> {
        const func = async (name: string, path: string, args: any[], key: string) => {
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
                console.error('ProxyRelay.createProxy()', document.location.href, error)

                throw error
            }
        }

        const result = await this.injectScript.run(func, [this.name, path!, args, RelayGlobalKey])

        return result?.[0]?.result;
    }

    public get(): T {
        if (!isAvailableScripting() && getManifestVersion() !== 2) {
            throw new Error(`You are trying to get proxy relay "${this.name}" from script content. You can get original relay instead`);
        }

        return super.get();
    }
}
