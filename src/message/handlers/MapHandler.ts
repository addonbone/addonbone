import AbstractHandler from "./AbstractHandler";
import {
    MessageData,
    MessageMap,
    MessageMapHandlers,
    MessageResponse,
    MessageSender,
    MessageType
} from "@typing/message";

export default class MapHandler<T extends MessageMap> extends AbstractHandler<T> {

    constructor(private map: MessageMapHandlers<T>) {
        super();
    }

    public run(type: MessageType<T>, data: MessageData<T, MessageType<T>>, sender: MessageSender): MessageResponse<T, MessageType<T>> | undefined {
        const handler = this.map[type];
        if (handler) {
            if (typeof handler === "function") {
                return handler(data, sender);
            } else {
                throw new Error(`Handler for type "${type}" in object of handlers must be a function`)
            }
        }
    }
}
