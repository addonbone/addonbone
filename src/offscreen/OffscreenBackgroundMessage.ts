import {Message} from "@message/providers";

type CreateParameters = chrome.offscreen.CreateParameters;

export default class OffscreenBackgroundMessage {
    protected message = new Message();
    protected readonly key: string = 'offscreen-background';
    private static instance?: OffscreenBackgroundMessage;

    public static getInstance(): OffscreenBackgroundMessage {
        return OffscreenBackgroundMessage.instance ??= new OffscreenBackgroundMessage();
    }

    public async createOffscreen(data: CreateParameters): Promise<any> {
        return await this.send(data);
    }

    public watch(handler: (data: CreateParameters) => any): () => void {
        return this.message.watch(this.key, handler);
    }

    protected async send(data: CreateParameters): Promise<any> {
        return await this.message.send(this.key, data);
    }
}
