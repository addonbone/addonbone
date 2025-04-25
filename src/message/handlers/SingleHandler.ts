import AbstractHandler from "./AbstractHandler";
import {MessageData, MessageTargetHandler, MessageMap, MessageResponse, MessageSender, MessageType} from "@typing/message";

export default class SingleHandler<T extends MessageMap> extends AbstractHandler<T> {

    constructor(private messageType: MessageType<T>, private handler: MessageTargetHandler<T, MessageType<T>>) {
        super();
    }

    public run(type: MessageType<T>, data: MessageData<T, MessageType<T>>, sender: MessageSender): MessageResponse<T, MessageType<T>> | undefined {
        if (type === this.messageType) {
            return this.handler(data, sender);
        }
    }
}
