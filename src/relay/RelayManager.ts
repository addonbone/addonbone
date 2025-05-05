import get from 'get-value'
import {
    PropertyOptions,
    RelayDictionary,
    RelayGlobalKey,
    RelayManager as RelayManagerContract,
    RelayName
} from "@typing/relay";

export default class RelayManager implements RelayManagerContract {
    private relays = new Map<
        RelayName,
        RelayDictionary[RelayName]
    >();

    public static getInstance(): RelayManagerContract {
        return globalThis[RelayGlobalKey] ??= new RelayManager();
    }

    public async property(
        name: RelayName,
        options?: PropertyOptions
    ): Promise<any> {
        const {path, args, getOptions} = options || {};
        const relay = this.get(name)

        const property = path == null ? relay : get(relay, path, getOptions)

        if (property === undefined) {
            throw new Error(`Property not found at path "${path}" in relay "${name}"`)
        }

        if (typeof property === 'function') {
            return await property.apply(relay, args);
        }

        return property
    }

    public add<K extends RelayName>(
        name: K,
        relay: RelayDictionary[K]
    ): this {
        this.relays.set(name, relay);

        return this;
    }

    public get<K extends RelayName>(
        name: K
    ): RelayDictionary[K] | undefined {
        return this.relays.get(name) as RelayDictionary[K] | undefined;
    }

    public has(name: RelayName): boolean {
        return this.relays.has(name);
    }

    public remove<K extends RelayName>(
        name: K
    ): RelayDictionary[K] | undefined {
        const relay = this.get(name);

        this.relays.delete(name);

        return relay;
    }

    public clear(): this {
        this.relays.clear();

        return this;
    }
}
