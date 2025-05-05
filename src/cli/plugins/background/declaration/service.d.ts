import ':package';
import type {ServiceProxyTarget, ServiceTarget} from ':package/service';

declare module ':package' {
    export interface ServiceRegistry {}

    export function getService<N extends keyof ServiceRegistry>(name: N): ServiceProxyTarget<ServiceRegistry, N>;
}

declare module ':package/service' {
    import type {ServiceRegistry} from ':package';

    export function getService<N extends keyof ServiceRegistry>(name: N): ServiceTarget<ServiceRegistry, N>;
}