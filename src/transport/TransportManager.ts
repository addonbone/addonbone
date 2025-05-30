import type {
    TransportDictionary,
    TransportManager as TransportManagerContract,
    TransportName
} from "@typing/transport";

export default abstract class TransportManager implements TransportManagerContract {
    private items = new Map<
        TransportName,
        TransportDictionary[TransportName]
    >();

    public add<K extends TransportName>(
        name: K,
        instance: TransportDictionary[K]
    ): this {
        this.items.set(name, instance);

        return this;
    }

    public get<K extends TransportName>(
        name: K
    ): TransportDictionary[K] | undefined {
        return this.items.get(name) as TransportDictionary[K] | undefined;
    }

    public has(name: TransportName): boolean {
        return this.items.has(name);
    }

    public remove<K extends TransportName>(
        name: K
    ): TransportDictionary[K] | undefined {
        const service = this.get(name);

        this.items.delete(name);

        return service;
    }

    public clear(): this {
        this.items.clear();

        return this;
    }
}
