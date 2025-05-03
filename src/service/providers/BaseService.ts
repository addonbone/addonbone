import {isBackground} from "@browser/runtime";

import ServiceManager from "../ServiceManager";

import {ServiceDictionary, ServiceManager as ServiceManagerContract, ServiceName} from "@typing/service";

export default class<N extends ServiceName, T = ServiceDictionary[N]> {
    constructor(protected readonly name: N) {
    }

    protected get manager(): ServiceManagerContract {
        return ServiceManager.getInstance();
    }

    public get(): T {
        if (!isBackground()) {
            throw new Error('BaseService.get() must be called from within the background context.');
        }

        return this.manager.get(this.name);
    }

    public destroy(): void {
        this.manager.remove(this.name);
    }
}
