import {BaseService, ProxyService, RegisterService} from "./providers";

import {ServiceDictionary, ServiceName} from "@typing/service";

export {type ServiceDictionary, RegisterService, ProxyService};

export const getService = <N extends ServiceName>(name: N): ServiceDictionary[N] => {
    return new BaseService(name).get();
}
