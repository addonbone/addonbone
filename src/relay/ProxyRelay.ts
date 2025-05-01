import {isAvailableScripting, scripting} from "@browser/scripting";
import {DeepAsyncProxy} from "@typing/helpers";

export default class ProxyRelay<T extends object>  {

    constructor(protected readonly name: string) {
    }

    private createProxy(tabId: number, frameId?: number, path?: string): DeepAsyncProxy<T> {
        const wrapped = () => {
        }

        const proxy = new Proxy(wrapped, {
            apply: async (_target, _thisArg, args) => {
                const result = await scripting.executeScript({
                    target: {
                        tabId,
                        frameIds: frameId !== undefined ? [frameId] : undefined,
                    },

                    func: async (name: string, path: string, args: any[],) => {
                        try {
                            const manager = window['__relay_manager']
                            const service = manager.get(name)
                            const property = path == null ? service : manager.getPropertyByPath(service, path)

                            if (property === undefined) {
                                throw new Error(`Property not found at path "${path}" in relay "${this.name}"`)
                            }

                            if (typeof property === 'function') {
                                return await property.apply(service, args);
                            }

                            return property
                        } catch (error) {
                            console.error('ProxyRelay.createProxy()', error)
                            throw error
                        }
                    },

                    args: [this.name, path!, args],
                });

                return result?.[0]?.result;
            },

            get: (_target, propertyName, receiver) => {
                if (propertyName === '__proxy' || typeof propertyName !== 'string') {
                    return Reflect.get(wrapped, propertyName, receiver);
                }
                const newPath = path == null ? propertyName : `${path}.${propertyName}`;
                return this.createProxy(tabId, frameId, newPath);
            },
        });

        // @ts-expect-error — Adding a hidden property
        proxy.__proxy = true;

        return proxy as unknown as DeepAsyncProxy<T>;
    }

    public get(tabId: number, frameId?:number): DeepAsyncProxy<T> {
        if (!isAvailableScripting()) {
            throw new Error(`You are trying to get proxy relay ${this.name} from script content. You can get original relay instead`);
        }

        return this.createProxy(tabId, frameId) as DeepAsyncProxy<T>;
    }
}
