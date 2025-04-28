import {isBackground} from "@browser/runtime";
import type {DefaultService, ProxyService as TProxyService} from "@typing/service";

import {Message} from "../message";
import ServiceManager from "./ServiceManager";

export default class ProxyService<T extends DefaultService,  TGet = TProxyService<T>> {
    protected readonly manager = ServiceManager.getInstance()
    protected readonly message = new Message();
    protected readonly messageKey: string;

    constructor(protected readonly name: string) {
        this.messageKey = `service.${this.name}`;
    }

    private createProxy(path?: string): TProxyService<T> {
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

        return proxy as unknown as TProxyService<T>;
    }

    public get(): TGet  {
        if(isBackground()){
            throw new Error('ProxyService.get() cannot be called in the background');
        }
        // @ts-expect-error — trust the subclass
        return this.createProxy();
    }
}
