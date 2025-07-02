import {Message, MessageSendOptions} from "@message/providers";

import type {MessageDictionary, MessageProvider} from "@typing/message";
import type {TransportMessage as TransportMessageContract, TransportMessageData} from "@typing/transport";

export default abstract class TransportMessage implements TransportMessageContract {
    private message: MessageProvider<MessageDictionary, MessageSendOptions> = new Message();

    protected abstract readonly key: string;

    public async send(data: TransportMessageData) {
        return this.message.send(this.key, data);
    }

    public watch(handler: (data: TransportMessageData) => any): void {
        this.message.watch(this.key, handler);
    }
}
