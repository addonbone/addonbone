import AbstractHandler from "./AbstractHandler";
import {
    MessageData,
    MessageGeneralHandler,
    MessageMap,
    MessageResponse,
    MessageSender,
    MessageType
} from "@typing/message";

export default class GeneralHandler<T extends MessageMap, K extends MessageType<T>> extends AbstractHandler<T> {

    constructor(private generalHandler: MessageGeneralHandler<T, K>) {
        super();
    }

    public run(type: K, data: MessageData<T, MessageType<T>>, sender: MessageSender): MessageResponse<T, MessageType<T>> | undefined {
        return this.generalHandler(type, data, sender);
    }
}
