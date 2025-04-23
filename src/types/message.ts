export type MessageSender = chrome.runtime.MessageSender;

export type MessageMap = Record<string, (data: any) => any>;

export type MessageType<T extends MessageMap> = Extract<keyof T, string>;
export type MessageData<T extends MessageMap, K extends MessageType<T>> = Parameters<T[K]>[0];
export type MessageResponse<T extends MessageMap, K extends MessageType<T>> = ReturnType<T[K]>;

export type MessageHandler<T extends MessageMap, K extends MessageType<T>> = (data: MessageData<T, K>, sender: MessageSender) => MessageResponse<T, K>
export type MessageMapHandlers<T extends MessageMap> = { [K in MessageType<T>]?: MessageHandler<T, K> }
export type MessageGeneralHandler<T extends MessageMap, K extends MessageType<T>> = (type: K, data: MessageData<T, K>, sender: MessageSender) => any

export interface MessageBody<T extends MessageMap, K extends MessageType<T>> {
    id: string;
    type: K;
    data: MessageData<T, K>;
    timestamp: number;
}

export interface MessageProvider<T extends MessageMap, TOptions = void> {
    send<K extends MessageType<T>>(type: K, data: MessageData<T, K>, options?: TOptions): Promise<MessageResponse<T, K>>;

    watch<K extends MessageType<T>>(type: K, handler: MessageHandler<T, K>): () => void;

    watch(map: MessageMapHandlers<T>): () => void;

    watch<K extends MessageType<T>>(general: MessageGeneralHandler<T, K>): () => void;
}

export interface MessageHandlerProvider<T extends MessageMap> {
    run(type: MessageType<T>, data: MessageData<T, MessageType<T>>, sender: MessageSender): MessageResponse<T, MessageType<T>> | undefined;
}
