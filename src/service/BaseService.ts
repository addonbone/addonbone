import {isBackground} from "@browser/runtime";

import ServiceManager from "./ServiceManager";
import {ServiceDictionary, ServiceName} from "@typing/service";

export default class BaseService<N extends ServiceName, T = ServiceDictionary[N]> {
    protected readonly manager = ServiceManager.getInstance()

    constructor(protected readonly name: N) {
    }

    public get(): T {
        if (!isBackground()) {
            throw new Error('RegisterService.get() must be called from within the background context.');
        }

        return this.manager.get(this.name);
    }

    public destroy(): void {
        this.manager.remove(this.name);
    }
}
