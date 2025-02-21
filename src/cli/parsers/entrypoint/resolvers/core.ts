import {Browser, Mode, Command} from "@typing/config";
import {Resolver} from "../types";

const name = 'adnbn';

export default (): Resolver[] => {
    const resolvers: Resolver[] = [];

    Object.entries(Browser).forEach(([key, value]) => {
        resolvers.push({
            from: name,
            target: 'Browser',
            name: key,
            value,
        });
    });

    Object.entries(Mode).forEach(([key, value]) => {
        resolvers.push({
            from: name,
            target: 'Mode',
            name: key,
            value,
        });
    });

    Object.entries(Command).forEach(([key, value]) => {
        resolvers.push({
            from: name,
            target: 'Command',
            name: key,
            value,
        });
    });

    return resolvers;
};