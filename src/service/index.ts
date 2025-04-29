import ProxyService from "./ProxyService";
import BaseService from "./BaseService";

import {DefaultService} from "@typing/service";

export * from "@typing/service"
export {default as ProxyService} from "./ProxyService";
export {default as RegisterService} from "./RegisterService";

export const getService = <T extends DefaultService>(name: string) => {
    return new ProxyService<T>(name).get();
}

export const getRegisteredService = <T extends DefaultService>(name: string) => {
    return new BaseService<T>(name).get();
}
