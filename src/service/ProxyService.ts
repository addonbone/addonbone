import {isBackground} from "@browser/runtime";
import {Message} from "@message/providers";

import BaseService from "./BaseService";

import {DeepAsyncProxy, ProxyKey} from "@typing/helpers";
import type {ServiceType} from "@typing/service";

export default class ProxyService<T extends ServiceType, TGet = DeepAsyncProxy<T>> extends BaseService<TGet>{
    protected readonly message = new Message();
    protected readonly messageKey: string;

    constructor(name: string) {
        super(name);
        this.messageKey = `service.${this.name}`;
    }

    private createProxy(path?: string): DeepAsyncProxy<T> {
        const wrapped = () => {
        }

        const proxy = new Proxy(wrapped, {
            apply: async (_target, _thisArg, args) => {
                return this.message.send(this.messageKey, {path, args});
            },

            get: (_target, propertyName, receiver) => {
                if (propertyName === '__proxy' || typeof propertyName !== 'string') {
                    return Reflect.get(wrapped, propertyName, receiver);
                }
                const newPath = path == null ? propertyName : `${path}.${String(propertyName)}`;
                return this.createProxy(newPath);
            },
        });

        proxy[ProxyKey] = true;

        return proxy as unknown as DeepAsyncProxy<T>;
    }

    public get(): TGet  {
        if(isBackground()){
            throw new Error('ProxyService.get() cannot be called in the background');
        }
        return this.createProxy() as TGet;
    }
}
