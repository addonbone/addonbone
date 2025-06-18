import {InjectCSS} from "./types";

type StyleOrigin = chrome.scripting.StyleOrigin

export type AbstractInjectCSSOptions = {
    tabId: number,
    frameId?: boolean | number | number[],
    matchAboutBlank?: boolean,
    origin?: StyleOrigin,
}

export default abstract class<T extends AbstractInjectCSSOptions> implements InjectCSS {
    protected constructor(protected options: AbstractInjectCSSOptions) {
    }

    public setOptions(options: Partial<T>): this {
        const {tabId = this.options.tabId, frameId, matchAboutBlank} = options;

        this.options = {...this.options, tabId, frameId, matchAboutBlank};

        return this;
    }

    public abstract run(css: string): Promise<void>

    public abstract file(files: string | string[]): Promise<void>

    protected get frameIds(): number[] | undefined {
        const {frameId} = this.options;

        return typeof frameId === 'number' ? [frameId] : typeof frameId !== 'boolean' ? frameId : undefined;
    }

    protected get allFrames(): boolean | undefined {
        const {frameId} = this.options;

        return typeof frameId === 'boolean' ? frameId : undefined;
    }

    protected get matchAboutBlank(): boolean {
        const {matchAboutBlank} = this.options;

        return typeof matchAboutBlank === "boolean" ? matchAboutBlank : true;
    }
}
