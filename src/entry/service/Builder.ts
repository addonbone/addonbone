import Builder from "@entry/core/Builder";
import RegisterService from "@service/RegisterService";

import {isValidServiceInitFunction, isValidServiceMainFunction, isValidServiceName} from "./resolvers";

import {
    ServiceBuilder,
    ServiceName,
    ServiceOptions,
    ServiceResolvedDefinition,
    ServiceType,
    ServiceUnresolvedDefinition
} from "@typing/service";

export default class<T extends ServiceType = ServiceType> extends Builder implements ServiceBuilder {
    protected readonly definition: ServiceResolvedDefinition<T>;

    protected service?: RegisterService<ServiceName, T, [ServiceOptions]>;

    public constructor(definition: ServiceUnresolvedDefinition<T>) {
        super();

        const {name, init} = definition;

        if (!isValidServiceInitFunction(init)) {
            throw new Error('The service entrypoint must export a init function');
        }

        if (!isValidServiceName(name)) {
            throw new Error('The service entrypoint must export a name string');
        }

        this.definition = {
            ...definition,
            name,
            init,
        };
    }

    public async build(): Promise<void> {
        const {name, init, main, ...definition} = this.definition;

        const options: ServiceOptions = {
            name,
            ...definition,
        };

        this.service = new RegisterService(name, init);

        this.service.register(options);

        if (isValidServiceMainFunction(main)) {
            await main(this.service.get(), options);
        }
    }

    public async destroy(): Promise<void> {
        this.service?.destroy();

        this.service = undefined;
    }
}