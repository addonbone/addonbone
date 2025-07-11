import core from "./core";
import {Injector} from "../types";

export default (resolvers: Injector[]) =>
    (form: string, target: string, name: string): any => {
        return [...resolvers, ...core()].find(
            resolver => resolver.from === form && resolver.target === target && resolver.name === name
        )?.value;
    };
