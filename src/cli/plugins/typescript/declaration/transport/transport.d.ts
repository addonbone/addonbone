import ":package";
import type {LayerProxyTarget, LayerTarget} from ":package/:layer";

declare module ":package" {
    // prettier-ignore
    export interface LayerRegistry { [name: string]: any }

    export function getLayer<N extends keyof LayerRegistry>(name: N): LayerProxyTarget<LayerRegistry, N>;
}

declare module ":package/:layer" {
    import type {LayerRegistry} from ":package";

    export function getLayer<N extends keyof LayerRegistry>(name: N): LayerTarget<LayerRegistry, N>;
}
