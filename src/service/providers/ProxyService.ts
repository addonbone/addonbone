import {isBackground} from "@browser/runtime";
import {Message, MessageSendOptions} from "@message/providers";

import BaseService from "./BaseService";

import {ServiceDictionary, ServiceName} from "@typing/service";
import {MessageDictionary, MessageProvider} from "@typing/message";
import {DeepAsyncProxy} from "@typing/helpers";

export default class<N extends ServiceName, T = DeepAsyncProxy<ServiceDictionary[N]>> extends BaseService<N, T> {
    private _message?: MessageProvider<MessageDictionary, MessageSendOptions>;

    protected readonly messageKey: string;

    constructor(name: N) {
        super(name);

        this.messageKey = `service.${this.name}`;
    }

    protected get message(): MessageProvider<MessageDictionary, MessageSendOptions> {
        return this._message ??= new Message();
    }

    private createProxy(path?: string): T {
        const wrapped = () => {
        }

        const proxy = new Proxy(wrapped, {
            apply: async (_target, _thisArg, args) => {
                return this.message.send(this.messageKey, {path, args});
            },

            get: (_target, propertyName, receiver) => {
                if (propertyName === '__proxy' || typeof propertyName !== 'string') {
                    return Reflect.get(wrapped, propertyName, receiver);
                }

                const newPath = path == null ? propertyName : `${path}.${String(propertyName)}`;

                return this.createProxy(newPath);
            },
        });

        // @ts-expect-error — Adding a hidden property
        proxy.__proxy = true;

        return proxy as unknown as T;
    }

    public get(): T {
        if (isBackground()) {
            throw new Error(`You are trying to get proxy service "${this.name}" from background. You can get original service instead`);
        }

        return this.createProxy();
    }
}
