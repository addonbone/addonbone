import {closeOffscreen, createOffscreen, hasOffscreen} from "@adnbn/browser";
import {__t} from "@main/locale";

import ProxyTransport from "@transport/ProxyTransport";

import OffscreenManager from "../OffscreenManager";
import OffscreenMessage from "../OffscreenMessage";

import {isOffscreen} from "../utils";

import type {DeepAsyncProxy} from "@typing/helpers";
import type {TransportDictionary, TransportManager, TransportMessage, TransportName} from "@typing/transport";

type CreateParameters = chrome.offscreen.CreateParameters;

export default class<N extends TransportName, T = DeepAsyncProxy<TransportDictionary[N]>> extends ProxyTransport<N, T> {
    protected message: TransportMessage;

    constructor(name: N, private parameters: CreateParameters) {
        super(name);

        this.message = new OffscreenMessage(name);
    }

    protected manager(): TransportManager {
        return OffscreenManager.getInstance();
    }

    protected async apply(args: any[], path?: string): Promise<any> {
        if (await hasOffscreen()) {
            await closeOffscreen();
        }

        const {justification, ...parameters} = this.parameters;

        await createOffscreen({
            ...parameters,
            justification: __t(justification),
        });

        return this.message.send({path, args});
    }

    public get(): T {
        if (isOffscreen()) {
            throw new Error(`You are trying to get proxy offscreen service "${this.name}" from offscreen. You can get original offscreen service instead`);
        }

        return super.get()
    }
}
