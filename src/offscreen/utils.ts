import {OffscreenGlobalAccess} from "@typing/offscreen";

export const isOffscreen = () => {
    return globalThis[OffscreenGlobalAccess] === true;
};
