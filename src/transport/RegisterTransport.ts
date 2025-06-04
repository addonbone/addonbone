import get from "get-value";

import BaseTransport from "./BaseTransport";

import type {TransportDictionary, TransportMessage, TransportName, TransportRegister} from "@typing/transport";

export default abstract class<
    N extends TransportName,
    T extends object = TransportDictionary[N],
    A extends any[] = []
> extends BaseTransport<N, T> implements TransportRegister<T, A> {
    protected constructor(name: N, protected readonly init: (...args: A) => T) {
        super(name);
    }

    protected abstract message(): TransportMessage;

    public register(...args: A) {
        if (this.manager().has(this.name)) {
            throw new Error(`A instance with name "${this.name}" already exists. The name must be unique.`);
        }

        const instance = this.init(...args);

        this.manager().add(this.name, instance);

        this.message().watch(async ({path, args}) => {
            try {
                const property = path == null ? instance : get(instance, path);

                if (property === undefined) {
                    throw new Error(`Property not found at path "${path}" in "${this.name}"`);
                }

                if (typeof property === 'function') {
                    return await property.apply(instance, args);
                }

                return property

            } catch (error) {
                console.error('register() error', error);

                throw error;
            }
        });

        return instance
    }
}
