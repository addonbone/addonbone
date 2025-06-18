import type {InjectScriptV2Options} from "./InjectScriptV2";
import type {InjectScriptV3Options} from "./InjectScriptV3";

type Awaited<T> = chrome.scripting.Awaited<T>;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>

export type AbstractInjectScriptOptions = {
    tabId: number,
    frameId?: boolean | number | number[],
    matchAboutBlank?: boolean,
    injectImmediately?: boolean,
}

export default abstract class {
    protected constructor(protected options: AbstractInjectScriptOptions) {
    }

    public setOptions(options: Partial<InjectScriptV2Options & InjectScriptV3Options>): this {
        const {world, timeFallback, documentId, ...currentOptions} = options
        this.options = {...this.options, ...currentOptions};
        return this
    }

    public abstract run<A extends any[], T extends any>(func: (...args: A) => T, args?: A): Promise<InjectionResult<Awaited<T>>[]>

    public abstract file(files: string | string[]): Promise<void>

    protected get frameIds() {
        const {frameId} = this.options
        return typeof frameId === 'number' ? [frameId] : typeof frameId !== 'boolean' ? frameId : undefined;
    }

    protected get allFrames() {
        const {frameId} = this.options
        return typeof frameId === 'boolean' ? frameId : undefined;
    }

    protected get matchAboutBlank() {
        const {matchAboutBlank} = this.options
        return typeof matchAboutBlank === "boolean" ? matchAboutBlank : true;
    }
}
