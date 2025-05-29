import get from "get-value";
import type {TransportDictionary, TransportManager, TransportName} from "@typing/transport";

export default abstract class<N extends TransportName, T = TransportDictionary[N]> {
    protected constructor(protected readonly name: N) {
    }

    protected abstract manager() : TransportManager;

    public get(): T {
        return this.manager().get(this.name);
    }

    public destroy(): void {
        this.manager().remove(this.name);
    }

    protected initAndSave<A extends any[]>(init: (...args: A) => T, args: A): T {
        const item = init(...args);

        this.manager().add(this.name, item);

        return item
    }

    protected async getProperty<T extends object = any>(args: any[], service: T, path?: string): Promise<any> {
        const property = path == null ? service : get(service, path);

        if (property === undefined) {
            throw new Error(`Property not found at path "${path}" in "${this.name}"`);
        }

        if (typeof property === 'function') {
            return await property.apply(service, args);
        }

        return property
    }
}
