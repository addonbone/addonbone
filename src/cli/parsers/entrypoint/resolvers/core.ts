import {Command, Mode, packageName} from "@typing/app";
import {Browser} from "@typing/browser";
import {ContentScriptAppend} from "@typing/content";

import {Resolver} from "../types";


export default (): Resolver[] => {
    const resolvers: Resolver[] = [];

    Object.entries(Browser).forEach(([key, value]) => {
        resolvers.push({
            from: packageName,
            target: 'Browser',
            name: key,
            value,
        });
    });

    Object.entries(Mode).forEach(([key, value]) => {
        resolvers.push({
            from: packageName,
            target: 'Mode',
            name: key,
            value,
        });
    });

    Object.entries(Command).forEach(([key, value]) => {
        resolvers.push({
            from: packageName,
            target: 'Command',
            name: key,
            value,
        });
    });

    Object.entries(ContentScriptAppend).forEach(([key, value]) => {
        resolvers.push({
            from: packageName,
            target: 'ContentScriptAppend',
            name: key,
            value,
        });
    });

    return resolvers;
};