import {executeScript} from "@adnbn/browser";

import AbstractInjectScript, {type AbstractInjectScriptOptions} from "./AbstractInjectScript";

type Awaited<T> = chrome.scripting.Awaited<T>;
type ExecutionWorld = chrome.scripting.ExecutionWorld
type InjectionTarget = chrome.scripting.InjectionTarget
type InjectionResult<T> = chrome.scripting.InjectionResult<T>

export interface InjectScriptV3Options extends AbstractInjectScriptOptions {
    world?: ExecutionWorld;
    documentId?: string | string[];
}

export default class extends AbstractInjectScript<InjectScriptV3Options> {
    constructor(protected options: InjectScriptV3Options) {
        super(options);
    }

    public setOptions(options: Partial<InjectScriptV3Options>): this {
        const {world, documentId} = options;

        this.options = {...this.options, world, documentId};

        super.setOptions(options);

        return this;
    }

    public async run<A extends any[], R extends any>(func: (...args: A) => R, args?: A): Promise<InjectionResult<Awaited<R>>[]> {
        const {world, injectImmediately} = this.options;

        return executeScript({target: this.target, func, args, world, injectImmediately});
    }

    public async file(fileList: string | string[]): Promise<void> {
        const {world, injectImmediately} = this.options;
        const files = typeof fileList === 'string' ? [fileList] : fileList;

        await executeScript({target: this.target, files, world, injectImmediately});
    }

    protected get target(): InjectionTarget {
        const {tabId} = this.options;

        return {
            tabId,
            allFrames: this.allFrames,
            frameIds: this.frameIds,
            documentIds: this.documentIds,
        };
    }

    protected get documentIds(): string[] | undefined {
        const {documentId} = this.options;

        return typeof documentId === 'string' ? [documentId] : documentId;
    }
}
