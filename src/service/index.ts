import ProxyService from "./ProxyService";
import BaseService from "./BaseService";

import {ServiceType} from "@typing/service";

export {default as ProxyService} from "./ProxyService";
export {default as RegisterService} from "./RegisterService";

export const getService = <T extends ServiceType>(name: string) => {
    return new ProxyService<T>(name).get();
}

export const getRegisteredService = <T extends ServiceType>(name: string) => {
    return new BaseService<T>(name).get();
}
