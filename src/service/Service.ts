import get from 'get-value';
import {isBackground} from "@browser/runtime";
import {DefaultService, ProxyService} from "@typing/service";

import {Message} from "../message";
import ServiceManager from "./ServiceManager";

export default class Service<T extends DefaultService, TArgs extends any[] = []> {
    private readonly manager = ServiceManager.getInstance()
    private readonly message = new Message();
    private readonly messageKey: string;
    private service: T | undefined;

    constructor(
        private readonly name: string,
        private readonly init: (...args: TArgs) => T
    ) {
        this.messageKey = `proxy-service.${this.name}`;
    }

    private createProxy(path?: string): ProxyService<T> {
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

        return proxy as unknown as ProxyService<T>;
    }

    register(...args: TArgs): T {
        if (this.manager.has(this.name)) {
            throw new Error(`A service with the name "${this.name}" already exists. The service name must be unique.`);
        }

        this.service = this.init(...args);

        this.manager.add(this.name, this.service);

        this.message.watch(this.messageKey, async ({path, args}) => {
            try {
                if (!this.service) {
                    throw new Error(`Service is not initialized for key: ${this.messageKey}`);
                }

                const property = path == null ? this.service : get(this.service, path);

                if (!property) {
                    throw new Error(`Property not found at path "${path}" in service "${this.name}"`);
                }

                if (typeof property === 'function') {
                    return await property.apply(this.service, args);
                }

                return property

            } catch (error) {
                console.error('ProxyService error:', error);
                throw error;
            }
        });

        return this.service;
    }

    get(): ProxyService<T> {
        if (isBackground()) {
            if (!this.service) {
                throw new Error(
                    `Service "${this.name}" not registered. Please register the service in the background.`,
                );
            }
            return this.service as ProxyService<T>;
        }

        return this.createProxy();
    }
}
