import {isBackground} from "@adnbn/browser";

import {Message} from "@message/providers";

import AbstractOffscreenBackground from "./AbstractOffscreenBackground";

type CreateParameters = chrome.offscreen.CreateParameters;

export default class OffscreenBackgroundMessage extends AbstractOffscreenBackground {
    protected message = new Message();
    protected readonly key: string = 'offscreen-background';
    private static instance?: OffscreenBackgroundMessage;

    public static getInstance(): OffscreenBackgroundMessage {
        return OffscreenBackgroundMessage.instance ??= new OffscreenBackgroundMessage();
    }

    public async createOffscreen(data: CreateParameters): Promise<any> {
        return isBackground() ? await this.addFrame(data) : await this.send(data);
    }

    public watch(handler: (data: CreateParameters) => any): () => void {
        return this.message.watch(this.key, handler);
    }

    protected async send(data: CreateParameters): Promise<any> {
        return await this.message.send(this.key, data);
    }
}
