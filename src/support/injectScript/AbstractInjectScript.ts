import type {InjectScript} from "./types";

type Awaited<T> = chrome.scripting.Awaited<T>;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>

export type AbstractInjectScriptOptions = {
    tabId: number,
    frameId?: boolean | number | number[],
    matchAboutBlank?: boolean,
    injectImmediately?: boolean,
}

export default abstract class<T extends AbstractInjectScriptOptions> implements InjectScript {
    protected constructor(protected options: AbstractInjectScriptOptions) {
    }

    public setOptions(options: Partial<T>): this {
        const {tabId = this.options.tabId, frameId, matchAboutBlank, injectImmediately} = options

        this.options = {...this.options, tabId, frameId, matchAboutBlank, injectImmediately};

        return this
    }

    public abstract run<A extends any[], R extends any>(func: (...args: A) => R, args?: A): Promise<InjectionResult<Awaited<R>>[]>

    public abstract file(files: string | string[]): Promise<void>

    protected get frameIds(): number[] | undefined {
        const {frameId} = this.options
        return typeof frameId === 'number' ? [frameId] : typeof frameId !== 'boolean' ? frameId : undefined;
    }

    protected get allFrames(): boolean | undefined {
        const {frameId} = this.options
        return typeof frameId === 'boolean' ? frameId : undefined;
    }

    protected get matchAboutBlank(): boolean {
        const {matchAboutBlank} = this.options
        return typeof matchAboutBlank === "boolean" ? matchAboutBlank : true;
    }
}
