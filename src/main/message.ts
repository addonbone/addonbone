import {Message, MessageSendOptions} from "@message/providers";

import {
    MessageData,
    MessageDictionary,
    MessageGeneralHandler,
    MessageMapHandler,
    MessageResponse,
    MessageTargetHandler,
    MessageType,
} from "@typing/message";

export const sendMessage = async <T extends MessageDictionary, K extends MessageType<T>>(
    type: K,
    data: MessageData<T, K>,
    options?: MessageSendOptions
): Promise<MessageResponse<T, K>> => {
    return await new Message<T>().send(type, data, options);
}

export const onMessage = <T extends MessageDictionary, K extends MessageType<T>>(
    arg1: K | MessageMapHandler<T> | MessageGeneralHandler<T, K>,
    arg2?: MessageTargetHandler<T, K>
): () => void => {
    return new Message<T>().watch(arg1, arg2);
}
