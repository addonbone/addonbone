import AbstractHandler from "./AbstractHandler";
import {MessageData, MessageGeneralHandler, MessageMap, MessageSender, MessageType} from "@typing/message";

export default class GeneralHandler<T extends MessageMap, K extends MessageType<T>> extends AbstractHandler<T> {

    constructor(private generalHandler: MessageGeneralHandler<T, K>) {
        super();
    }

    public run(type: K, data: MessageData<T, MessageType<T>>, sender: MessageSender): any {
        return this.generalHandler(type, data, sender);
    }
}
