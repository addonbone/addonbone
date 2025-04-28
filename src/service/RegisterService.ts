import get from 'get-value';
import {isBackground} from "@browser/runtime";
import type {DefaultService} from "@typing/service";
import ProxyService from "./ProxyService";

export default class RegisterService<T extends DefaultService, TArgs extends any[] = []> extends ProxyService<T, T> {
    constructor(name: string, protected readonly init: (...args: TArgs) => T) {
        super(name)
    }

    public register(...args: TArgs): T {
        if (this.manager.has(this.name)) {
            throw new Error(`A service with the name "${this.name}" already exists. The service name must be unique.`);
        }

        const service = this.init(...args);

        this.manager.add(this.name, service);

        this.message.watch(this.messageKey, async ({path, args}) => {
            try {
                const property = path == null ? service : get(service, path);

                if (!property) {
                    throw new Error(`Property not found at path "${path}" in service "${this.name}"`);
                }

                if (typeof property === 'function') {
                    return await property.apply(service, args);
                }

                return property

            } catch (error) {
                console.error('ProxyService error:', error);
                throw error;
            }
        });

        return service;
    }

    public get(): T {
        if(!isBackground()){
            throw new Error('RegisterService.get() must be called from within the background context.');
        }
        return this.manager.get(this.name);
    }
}
