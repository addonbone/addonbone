import {Command, Mode, PackageName} from "@typing/app";
import {Browser} from "@typing/browser";
import {ContentScriptAppend} from "@typing/content";
import {OffscreenReason} from "@typing/offscreen";

import {Injector} from "../types";

export default (): Injector[] => {
    const resolvers: Injector[] = [];

    Object.entries(Browser).forEach(([key, value]) => {
        resolvers.push({
            from: PackageName,
            target: "Browser",
            name: key,
            value,
        });
    });

    Object.entries(Mode).forEach(([key, value]) => {
        resolvers.push({
            from: PackageName,
            target: "Mode",
            name: key,
            value,
        });
    });

    Object.entries(Command).forEach(([key, value]) => {
        resolvers.push({
            from: PackageName,
            target: "Command",
            name: key,
            value,
        });
    });

    Object.entries(ContentScriptAppend).forEach(([key, value]) => {
        resolvers.push({
            from: PackageName,
            target: "ContentScriptAppend",
            name: key,
            value,
        });
    });

    Object.entries(OffscreenReason).forEach(([key, value]) => {
        resolvers.push({
            from: PackageName,
            target: "OffscreenReason",
            name: key,
            value,
        });
    });

    return resolvers;
};
