import {insertCss} from "@adnbn/browser";

import AbstractInjectCSS, {AbstractInjectCSSOptions} from "./AbstractInjectCSS";

type InjectionTarget = chrome.scripting.InjectionTarget

export interface InjectCSSV3Options extends AbstractInjectCSSOptions {
    documentId?: string | string[];
}

export default class extends AbstractInjectCSS<InjectCSSV3Options> {
    constructor(protected options: InjectCSSV3Options) {
        super(options);
    }

    public setOptions(options: Partial<InjectCSSV3Options>): this {
        const {documentId} = options;

        this.options = {...this.options, documentId};

        super.setOptions(options);

        return this;
    }

    public async run(css: string): Promise<void> {
        const {origin} = this.options;

        return insertCss({target: this.target, css, origin});
    }

    public async file(fileList: string | string[]): Promise<void> {
        const {origin} = this.options;
        const files = typeof fileList === 'string' ? [fileList] : fileList;

        await insertCss({target: this.target, files, origin});
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
