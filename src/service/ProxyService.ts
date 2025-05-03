import {isBackground} from "@browser/runtime";
import {Message} from "@message/providers";

import BaseService from "./BaseService";

import type {ServiceDictionary, ServiceName} from "@typing/service";
import type {DeepAsyncProxy} from "@typing/helpers";

export default class ProxyService<N extends ServiceName, T = DeepAsyncProxy<ServiceDictionary[N]>> extends BaseService<N, T> {
    protected readonly message = new Message();
    protected readonly messageKey: string;

    constructor(name: N) {
        super(name);

        this.messageKey = `service.${this.name}`;
    }

    private createProxy(path?: string): T {
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

        // @ts-expect-error — Adding a hidden property
        proxy.__proxy = true;

        return proxy as unknown as T;
    }

    public get(): T {
        if (isBackground()) {
            throw new Error('ProxyService.get() cannot be called in the background');
        }

        return this.createProxy();
    }
}
