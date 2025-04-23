import {browser} from '@browser/env'
import {HandlerProvider, MessageBody, MessageMap, MessageSender, MessageType} from '@typing/message';

const runtime = browser().runtime;

export default class MessageSubscriptionManager<T extends MessageMap> {
    private handlers: Set<HandlerProvider<T>> = new Set()
    private isListenerAttached = false;

    constructor() {
        this.listener = this.listener.bind(this);
    }

    public addHandler(handler: HandlerProvider<T>) {
        this.handlers.add(handler);
        this.updateListener();
    }

    public removeHandler(handler: HandlerProvider<T>) {
        this.handlers.delete(handler);
        this.updateListener();
    }

    public clearAllHandlers() {
        this.handlers = new Set();
        this.updateListener();
    }

    private updateListener() {
        if (this.handlers.size > 0 && !this.isListenerAttached) {
            runtime.onMessage.addListener(this.listener);
            this.isListenerAttached = true;
        } else if (this.handlers.size === 0 && this.isListenerAttached) {
            runtime.onMessage.removeListener(this.listener);
            this.isListenerAttached = false;
        }
    }

    private listener<K extends MessageType<T>>(
        message: MessageBody<T, K>,
        sender: MessageSender,
        sendResponse: (response?: any) => void
    ): boolean | void {
        if (!message || typeof message !== 'object' || !message.type) return;

        const results: Promise<any>[] = [];

        for (const handler of this.handlers) {
            try {
                const result = handler.run(message.type, message.data, sender);
                if (result !== undefined) {
                    results.push(Promise.resolve(result));
                }
            } catch (err) {
                console.error('Message handler error:', err);
            }
        }

        if (results.length > 1) {
            throw new Error(`Message type "${message.type}" has multiple handlers returning a response. Only one response is allowed.`)
        }

        if (results.length === 1) {
            results[0].then(sendResponse);
            return true;
        }
    };
}
