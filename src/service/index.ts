import {BaseService, ProxyService, RegisterService} from "./providers";

import {ServiceDictionary, ServiceName, ServiceProxyTarget, ServiceTarget} from "@typing/service";

export {
    type ServiceDictionary,
    type ServiceName,
    type ServiceTarget,
    type ServiceProxyTarget,
    RegisterService,
    ProxyService
};

export const getService = <N extends ServiceName>(name: N): ServiceDictionary[N] => {
    return new BaseService(name).get();
}
