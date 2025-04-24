import {nanoid} from 'nanoid';
import {
    MessageBody,
    MessageData,
    MessageGeneralHandler,
    MessageHandler,
    MessageMap,
    MessageMapHandlers,
    MessageProvider,
    MessageResponse,
    MessageType
} from '@typing/message'

export default abstract class AbstractMessage<T extends MessageMap, TOptions> implements MessageProvider<T, TOptions> {
    public abstract send<K extends MessageType<T>>(type: K, data: MessageData<T, K>, options?: TOptions): Promise<MessageResponse<T, K>>;

    public abstract watch<K extends MessageType<T>>(type: K, handler: MessageHandler<T, K>): () => void;

    public abstract watch(map: MessageMapHandlers<T>): () => void;

    public abstract watch<K extends MessageType<T>>(general: MessageGeneralHandler<T, K>): () => void;

    protected buildMessage<K extends MessageType<T>>(type: K, data: MessageData<T, K>): MessageBody<T, K> {
        return {
            id: nanoid(),
            type,
            data,
            timestamp: Date.now(),
        };
    }
}
