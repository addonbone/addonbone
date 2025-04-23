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
    private handlers: Array<{
        type?: MessageType<T>,
        handler?: MessageHandler<T, any>,
        map?: { [key in MessageType<T>]?: MessageHandler<T, any> },
        general?: MessageGeneralHandler<T, any>
    }> = [];

    private isListenerAttached = false;

    constructor() {
        super();
        this.globalListener = this.globalListener.bind(this);
    }

    send<K extends MessageType<T>>(type: K, data: MessageData<T, K>, options?: SendOptions): Promise<MessageResponse<T, K>> {
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
        arg1: K | { [K in MessageType<T>]?: MessageHandler<T, K> } | MessageGeneralHandler<T, K>,
        arg2?: MessageHandler<T, K>
    ): () => void {
        const entry = typeof arg1 === 'function'
            ? {general: arg1}
            : typeof arg1 === 'object' && arg2 === undefined
                ? {map: arg1}
                : {type: arg1 as K, handler: arg2};

        this.handlers.push(entry);


        if (!this.isListenerAttached) {
            runtime.onMessage.addListener(this.globalListener);
            this.isListenerAttached = true;
        }

        return () => {
            const entryIndex = this.handlers.indexOf(entry);
            if (entryIndex !== -1) {
                this.handlers.splice(entryIndex, 1);
            }
            if (this.handlers.length === 0) {
                runtime.onMessage.removeListener(this.globalListener);
                this.isListenerAttached = false;
            }
        };
    }

    private globalListener<K extends MessageType<T>>(
        message: MessageBody<T, K>,
        sender: MessageSender,
        sendResponse: (response?: any) => void
    ): boolean | void {
        if (!message || typeof message !== 'object' || !message.type || !('data' in message)) return;

        const {type, data} = message;

        const results: Promise<any>[] = [];

        for (const {type: messageType, handler, map, general} of this.handlers) {
            try {
                if (general) {
                    const result = general(type, data, sender);
                    if (result !== undefined) {
                        results.push(Promise.resolve(result));
                    }
                    continue;
                }

                if (map && typeof map[type] === 'function') {
                    const result = map[type]?.(data, sender);
                    if (result !== undefined) {
                        results.push(Promise.resolve(result));
                    }
                    continue;
                }

                if (handler && messageType === type) {
                    const result = handler(data, sender);
                    if (result !== undefined) {
                        results.push(Promise.resolve(result));
                    }
                }
            } catch (err) {
                console.error('Message handler error:', err);
            }
        }

        if (results.length > 1) {
            throw new Error(`Message type "${type}" has multiple handlers returning a response. Only one response is allowed.`)
        }

        if (results.length === 1) {
            results[0].then(sendResponse);
            return true;
        }
    };
}
