import AbstractHandler from "./AbstractHandler";
import {MessageData, MessageHandler, MessageMap, MessageSender, MessageType} from "@typing/message";

export default class MapHandler<T extends MessageMap> extends AbstractHandler<T> {

    constructor(private map: { [K in MessageType<T>]?: MessageHandler<T, K> }) {
        super();
    }

    public run(type: MessageType<T>, data: MessageData<T, MessageType<T>>, sender: MessageSender): any {
        const handler = this.map[type];
        if (handler && typeof handler === "function") {
            return handler(data, sender);
        }
    }
}
