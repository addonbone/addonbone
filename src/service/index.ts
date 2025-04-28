import {DefaultService} from "@typing/service";
import ProxyService from "./ProxyService";
import RegisterService from "./RegisterService";

export * from "@typing/service"
export {default as ProxyService} from "./ProxyService";
export {default as RegisterService} from "./RegisterService";

export const getService = <T extends DefaultService>(name: string) => {
    const service = new ProxyService<T>(name);
    return service.get()
}

export const getRegisteredService = <T extends DefaultService, TArgs extends any[] = []>(
    name: string,
    init: (...args: TArgs) => T
) => {
    const service = new RegisterService<T, TArgs>(name, init);
    return service.get()
}
