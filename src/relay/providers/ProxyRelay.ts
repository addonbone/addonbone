import {executeScript, isAvailableScripting} from "@browser/scripting";

import {DeepAsyncProxy} from "@typing/helpers";
import {RelayGlobalKey, RelayName, RelayDictionary} from "@typing/relay";

type InjectionTarget = chrome.scripting.InjectionTarget;

export default class<N extends RelayName, T = DeepAsyncProxy<RelayDictionary[N]>> {
    constructor(protected readonly name: N) {
    }

    private createProxy(options: number | InjectionTarget, path?: string): T {
        const wrapped = () => {
        }

        const target = typeof options === 'number' ? {tabId: options} : options;

        const proxy = new Proxy(wrapped, {
            apply: async (_target, _thisArg, args) => {
                const result = await executeScript({
                    target,

                    func: async (name: string, path: string, args: any[], key: string) => {
                        try {
                            return await globalThis[key].property({name, path, args})
                        } catch (error) {
                            console.error('ProxyRelay.createProxy()', error)
                            throw error
                        }
                    },

                    args: [this.name, path!, args, RelayGlobalKey],
                });

                return result?.[0]?.result;
            },

            get: (_target, propertyName, receiver) => {
                if (propertyName === '__proxy' || typeof propertyName !== 'string') {
                    return Reflect.get(wrapped, propertyName, receiver);
                }
                const newPath = path == null ? propertyName : `${path}.${propertyName}`;
                return this.createProxy(options, newPath);
            },
        });

        proxy['__proxy'] = true;

        return proxy as unknown as T;
    }

    public get(options: number | InjectionTarget): T {
        if (!isAvailableScripting()) {
            throw new Error(`You are trying to get proxy relay "${this.name}" from script content. You can get original relay instead`);
        }

        return this.createProxy(options);
    }
}
