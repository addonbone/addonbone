import {HandlerProvider, MessageData, MessageMap, MessageSender, MessageType} from "@typing/message";

export default abstract class AbstractHandler<T extends MessageMap> implements HandlerProvider<T> {

    public abstract run(type: MessageType<T>, data: MessageData<T, MessageType<T>>, sender: MessageSender): any
}
