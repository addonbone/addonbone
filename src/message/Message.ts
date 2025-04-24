import {browser} from '@browser/env'
import {throwRuntimeError} from "@browser/runtime";
import {
    MessageData,
    MessageGeneralHandler,
    MessageTargetHandler,
    MessageHandler,
    MessageMap,
    MessageMapHandler,
    MessageResponse,
    MessageType
} from '@typing/message';

import AbstractMessage from './AbstractMessage';
import MessageSubscriptionManager from "./MessageSubscriptionManager";

import MapHandler from "./handlers/MapHandler";
import SingleHandler from "./handlers/SingleHandler";
import GeneralHandler from "./handlers/GeneralHandler";

const tabs = browser().tabs;
const runtime = browser().runtime;

type SendOptions = number | { tabId: number; frameId?: number }

export default class Message<T extends MessageMap> extends AbstractMessage<T, SendOptions> {
    private static manager = new MessageSubscriptionManager();

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
        arg1: K | MessageMapHandler<T> | MessageGeneralHandler<T, K>,
        arg2?: MessageTargetHandler<T, K>
    ): () => void {

        let handler: MessageHandler<T>

        if (typeof arg1 === 'function') {
            handler = new GeneralHandler<T, K>(arg1);
        } else if (typeof arg1 === 'object' && arg2 === undefined) {
            handler = new MapHandler<T>(arg1);
        } else if (typeof arg1 === 'string' && arg2) {
            handler = new SingleHandler<T>(arg1, arg2);
        } else {
            throw new Error('Invalid arguments passed to watch()');
        }

        Message.manager.add(handler);

        return () => Message.manager.remove(handler);
    }
}
