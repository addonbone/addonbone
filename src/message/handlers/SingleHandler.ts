import AbstractHandler from "./AbstractHandler";
import {MessageData, MessageHandler, MessageMap, MessageSender, MessageType} from "@typing/message";

export default class SingleHandler<T extends MessageMap> extends AbstractHandler<T> {

    constructor(private messageType: MessageType<T>, private handler: MessageHandler<T, MessageType<T>>) {
        super();
    }

    public run(type: MessageType<T>, data: MessageData<T, MessageType<T>>, sender: MessageSender): any {
        if (type === this.messageType) {
            return this.handler(data, sender);
        }
    }
}
