import BaseTransport from './BaseTransport'

import type {DeepAsyncProxy} from "@typing/helpers";
import type {TransportDictionary, TransportName} from "@typing/transport";

export default abstract class<N extends TransportName, T = DeepAsyncProxy<TransportDictionary[N]>> extends BaseTransport<N, T> {
    protected abstract apply(args: any[], path?: string): any

    protected createProxy(path?: string): T {
        const wrapped = () => {
        }

        const proxy = new Proxy(wrapped, {
            apply: async (_target, _thisArg, args) => this.apply(args, path),

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
        return this.createProxy();
    }
}
