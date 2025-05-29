import get from 'get-value';

import ServiceMessage from "../ServiceMessage";
import Service from "./Service";

import type {TransportDictionary, TransportMessage, TransportName} from "@typing/transport";

export default class<
    N extends TransportName,
    T extends object = TransportDictionary[N],
    A extends any[] = []
> extends Service<N, T> {
    protected message: TransportMessage

    constructor(name: N, protected readonly init: (...args: A) => T) {
        super(name)
        this.message = new ServiceMessage(name);
    }

    public register(...args: A): T {
        if (this.manager().has(this.name)) {
            throw new Error(`A service with the name "${this.name}" already exists. The service name must be unique.`);
        }

        const service = this.initAndSave(this.init, args);

        this.message.watch(async ({path, args}) => {
            try {
                return await this.getProperty(args, service, path);

            } catch (error) {
                console.error('RegisterService.register()', error);

                throw error;
            }
        });

        return service;
    }
}
