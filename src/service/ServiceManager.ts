import {
    ServiceDictionary,
    ServiceGlobalKey,
    ServiceManager as ServiceManagerContract,
    ServiceName
} from "@typing/service";

export default class ServiceManager implements ServiceManagerContract {
    private services = new Map<
        ServiceName,
        ServiceDictionary[ServiceName]
    >();

    public static getInstance(): ServiceManagerContract {
        return globalThis[ServiceGlobalKey] ??= new ServiceManager();
    }

    public add<K extends ServiceName>(
        name: K,
        instance: ServiceDictionary[K]
    ): this {
        this.services.set(name, instance);

        return this;
    }

    public get<K extends ServiceName>(
        name: K
    ): ServiceDictionary[K] | undefined {
        return this.services.get(name) as ServiceDictionary[K] | undefined;
    }

    public has(name: ServiceName): boolean {
        return this.services.has(name);
    }

    public remove<K extends ServiceName>(
        name: K
    ): ServiceDictionary[K] | undefined {
        const service = this.get(name);

        this.services.delete(name);

        return service;
    }

    public clear(): this {
        this.services.clear();

        return this;
    }
}