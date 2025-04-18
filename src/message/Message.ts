import {browser} from '@browser/env'
import {throwRuntimeError} from "@browser/runtime";
import {
    MessageBody,
    MessageData,
    MessageGeneralHandler,
    MessageHandler,
    MessageMap,
    MessageResponse,
    MessageSender,
    MessageType
} from '@typing/message';

import AbstractMessage from './AbstractMessage';

const tabs = browser().tabs;
const runtime = browser().runtime;

type SendOptions = number | { tabId: number; frameId?: number }

export default class Message<T extends MessageMap> extends AbstractMessage<T, SendOptions> {
    async send<K extends MessageType<T>>(type: K, data: MessageData<T, K>, options?: SendOptions): Promise<MessageResponse<T, K>> {
        const message = this.buildMessage(type, data);

        if (typeof options === 'number' || typeof options === 'object') {
            const tabId = typeof options === 'number' ? options : options.tabId;
            const frameId = typeof options === 'object' && options.frameId !== undefined ? options.frameId : undefined;

            return new Promise((resolve, reject) => {
                tabs.sendMessage(tabId, message, {frameId}, (response) => {
                    try {
                        throwRuntimeError()
                        resolve(response);
                    } catch (e) {
                        reject(e)
                    }
                });
            });
        }

        return new Promise((resolve, reject) => {
            runtime.sendMessage(message, (response) => {
                try {
                    throwRuntimeError()
                    resolve(response);
                } catch (e) {
                    reject(e)
                }
            });
        });
    }

    watch<K extends MessageType<T>>(
        arg1: K | { [key in K]?: MessageHandler<T, K> } | MessageGeneralHandler<T, K>,
        arg2?: MessageHandler<T, K>
    ): () => void {
        const listener = (
            message: MessageBody<T, K>,
            sender: MessageSender,
            sendResponse: (response?: any) => void
        ): boolean | void => {
            if (!message || typeof message !== 'object' || !message.type || !('data' in message)) return;

            try {
                if (typeof arg1 === 'function') {
                    const result = arg1(message.type, message.data, sender);

                    if (result && typeof result.then === 'function') {
                        result.then(sendResponse);
                    } else {
                        sendResponse(result);
                    }
                    return true;
                }

                if (typeof arg1 === 'object') {
                    const handler = arg1[message.type];

                    if (handler) {
                        const result = handler(message.data, sender);

                        if (result && typeof result.then === 'function') {
                            result.then(sendResponse);
                        } else {
                            sendResponse(result);
                        }
                        return true;
                    }

                }

                if (arg2 && message.type === arg1) {
                    const result = arg2(message.data, sender);

                    if (result && typeof result.then === 'function') {
                        result.then(sendResponse);
                    } else {
                        sendResponse(result);
                    }
                    return true;
                }
            } catch (err) {
                console.error('Message handler error:', err);
            }
        };

        runtime.onMessage.addListener(listener);

        return () => {
            runtime.onMessage.removeListener(listener);
        };
    }
}
