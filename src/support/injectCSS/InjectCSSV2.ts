import {insertCssTab} from "@adnbn/browser";

import AbstractInjectCSS, {AbstractInjectCSSOptions} from "./AbstractInjectCSS";

type InjectDetails = chrome.tabs.InjectDetails;

export interface InjectCSSV2Options extends AbstractInjectCSSOptions {
    runAt?: string;
}

export default class extends AbstractInjectCSS<InjectCSSV2Options> {
    public constructor(protected options: InjectCSSV2Options) {
        super(options);
    }

    public setOptions(options: Partial<InjectCSSV2Options>): this {
        const {runAt} = options;

        this.options = {...this.options, runAt};

        super.setOptions(options);

        return this;
    }

    public async run(code: string): Promise<void> {
        const {tabId, runAt} = this.options;

        const details: InjectDetails = {
            code,
            runAt,
            cssOrigin: this.cssOrigin,
            matchAboutBlank: this.matchAboutBlank,
        };

        if (this.allFrames) {
            await insertCssTab(tabId, {...details, allFrames: true});
        } else if (this.frameIds) {
            await Promise.all(this.frameIds.map(frameId => insertCssTab(tabId, {...details, frameId})));
        } else {
            await insertCssTab(tabId, details);
        }
    }

    public async file(files: string | string[]): Promise<void> {
        const {tabId, runAt, origin} = this.options;

        const fileList = typeof files === 'string' ? [files] : files;

        const injectTasks: Promise<any>[] = [];

        for (const file of fileList) {
            const details: InjectDetails = {
                file,
                runAt,
                cssOrigin: origin,
                matchAboutBlank: this.matchAboutBlank,
            };

            if (this.allFrames) {
                injectTasks.push(insertCssTab(tabId, {...details, allFrames: true}));
            } else if (this.frameIds) {
                injectTasks.push(...this.frameIds.map(frameId => insertCssTab(tabId, {...details, frameId})));
            } else {
                injectTasks.push(insertCssTab(tabId, details));
            }
        }

        await Promise.all(injectTasks);
    }

    protected get cssOrigin(): string | undefined {
        const {origin} = this.options;

        return origin && origin.toLowerCase();
    }
}
