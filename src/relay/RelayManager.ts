import get from 'get-value'
import {RelayWindowKey} from "@typing/relay";

type PropertyType = {
    name: string,
    path?: string,
    args?: any[],
    options?: get.Options,
}

export default class RelayManager {
    private instances = new Map<string, any>();

    public static getInstance(): RelayManager {
        if (window[RelayWindowKey] === undefined) {
            window[RelayWindowKey] = new RelayManager();
        }
        return window[RelayWindowKey];
    }

    public async property({name, path, args, options}: PropertyType): Promise<any> {
        const relay = this.get(name)
        const property = path == null ? relay : get(relay, path, options)

        if (property === undefined) {
            throw new Error(`Property not found at path "${path}" in relay "${name}"`)
        }

        if (typeof property === 'function') {
            return await property.apply(relay, args);
        }

        return property
    }

    public add(name: string, instance: any) {
        this.instances.set(name, instance);
    }

    public get(name: string): any | undefined {
        return this.instances.get(name);
    }

    public has(name: string): boolean {
        return this.instances.has(name);
    }

    public remove(name: string): any | undefined {
        const instance = this.get(name);
        this.instances.delete(name);
        return instance;
    }

    public clear(): void {
        this.instances.clear();
    }
}
