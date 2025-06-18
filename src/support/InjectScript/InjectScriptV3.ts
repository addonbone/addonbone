import {executeScript} from "@browser/scripting";

import AbstractInjectScript, {type AbstractInjectScriptOptions} from "./AbstractInjectScript";
import type {InjectScriptV2Options} from "./InjectScriptV2";

type Awaited<T> = chrome.scripting.Awaited<T>;
type ExecutionWorld = chrome.scripting.ExecutionWorld
type InjectionResult<T> = chrome.scripting.InjectionResult<T>

export type InjectScriptV3Options = AbstractInjectScriptOptions & {
    world?: ExecutionWorld,
    documentId?: string | string[],
}

export default class extends AbstractInjectScript {
    constructor(protected options: InjectScriptV3Options) {
        super(options)
    }

    public setOptions(options: Partial<InjectScriptV2Options & InjectScriptV3Options>): this {
        const {timeFallback, ...currentOptions} = options
        this.options = {...this.options, ...currentOptions};
        super.setOptions(options);
        return this
    }

    public async run<A extends any[], T extends any>(func: (...args: A) => T, args?: A): Promise<InjectionResult<Awaited<T>>[]> {
        const {world, injectImmediately} = this.options;

        return executeScript({target: this.target, func, args, world, injectImmediately})
    }

    public async file(fileList: string | string[]): Promise<void> {
        const {world, injectImmediately} = this.options;
        const files = typeof fileList === 'string' ? [fileList] : fileList;

        await executeScript({target: this.target, files, world, injectImmediately})
    }

    protected get target() {
        const {tabId} = this.options
        return {
            tabId,
            allFrames: this.allFrames,
            frameIds: this.frameIds,
            documentIds: this.documentIds,
        }
    }

    protected get documentIds() {
        const {documentId} = this.options
        return typeof documentId === 'string' ? [documentId] : documentId;
    }
}
