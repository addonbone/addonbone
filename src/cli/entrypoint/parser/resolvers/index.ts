import core from "./core";
import {Resolver} from "../types";

export default (resolvers: Resolver[]) => (form: string, target: string, name: string): any => {
    return [
        ...resolvers,
        ...core()
    ].find(resolver => resolver.from === form && resolver.target === target && resolver.name === name)?.value;
}