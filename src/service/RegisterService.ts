import get from 'get-value';

import ProxyService from "./ProxyService";

import {isBackground} from "@browser/runtime";

import type {ServiceDictionary, ServiceName} from "@typing/service";

export default class RegisterService<
    N extends ServiceName,
    T extends object = ServiceDictionary[N],
    A extends any[] = []
> extends ProxyService<N, T> {
    constructor(name: N, protected readonly init: (...args: A) => T) {
        super(name)
    }

    public register(...args: A): T {
        if (this.manager.has(this.name)) {
            throw new Error(`A service with the name "${this.name}" already exists. The service name must be unique.`);
        }

        const service = this.init(...args);

        this.manager.add(this.name, service);

        this.message.watch(this.messageKey, async ({path, args}) => {
            try {
                const property = path == null ? service : get(service, path);

                if (property === undefined) {
                    throw new Error(`Property not found at path "${path}" in service "${this.name}"`);
                }

                if (typeof property === 'function') {
                    return await property.apply(service, args);
                }

                return property

            } catch (error) {
                console.error('RegisterService.register()', error);

                throw error;
            }
        });

        return service;
    }

    public get(): T {
        if (!isBackground()) {
            throw new Error('RegisterService.get() must be called from within the background context.');
        }

        return this.manager.get(this.name);
    }
}
