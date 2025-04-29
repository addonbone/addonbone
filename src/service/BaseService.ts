import {isBackground} from "@browser/runtime";

import ServiceManager from "./ServiceManager";

export default class BaseService<T> {
    protected readonly manager = ServiceManager.getInstance()

    constructor(protected readonly name: string) {
    }

    public get(): T {
        if (!isBackground()) {
            throw new Error('RegisterService.get() must be called from within the background context.');
        }

        return this.manager.get(this.name);
    }
}
