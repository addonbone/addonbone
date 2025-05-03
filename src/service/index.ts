import BaseService from "./BaseService";

import {ServiceDictionary, ServiceName} from "@typing/service";

export {default as ProxyService} from "./ProxyService";
export {default as RegisterService} from "./RegisterService";
export type {ServiceDictionary};

export const getService = <N extends ServiceName>(name: N): ServiceDictionary[N] => {
    return new BaseService(name).get();
}
