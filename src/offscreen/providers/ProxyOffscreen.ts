import {closeOffscreen, createOffscreen, hasOffscreen, isManifestVersion3} from "@adnbn/browser";
import {__t} from "@main/locale";
import {getBrowser} from "@main/env";

import ProxyTransport from "@transport/ProxyTransport";

import OffscreenManager from "../OffscreenManager";
import OffscreenMessage from "../OffscreenMessage";
import OffscreenBridge from "../OffscreenBridge";

import {isOffscreen} from "../utils";

import {Browser} from "@typing/browser";
import {DeepAsyncProxy} from "@typing/helpers";
import {TransportDictionary, TransportManager, TransportMessage, TransportName} from "@typing/transport";

type CreateParameters = chrome.offscreen.CreateParameters;

export default class<N extends TransportName, T = DeepAsyncProxy<TransportDictionary[N]>> extends ProxyTransport<N, T> {
    protected message: TransportMessage;

    constructor(
        name: N,
        private parameters: CreateParameters
    ) {
        super(name);

        this.message = new OffscreenMessage(name);
    }

    protected manager(): TransportManager {
        return OffscreenManager.getInstance();
    }

    protected async apply(args: any[], path?: string): Promise<any> {
        const parameters: CreateParameters = {
            ...this.parameters,
            justification: __t(this.parameters.justification),
        };

        if (!isManifestVersion3() || getBrowser() === Browser.Firefox) {
            await OffscreenBridge.createOffscreen(parameters);
        } else {
            if (await hasOffscreen()) {
                await closeOffscreen();
            }

            await createOffscreen(parameters);
        }

        return this.message.send({path, args});
    }

    public get(): T {
        if (isOffscreen()) {
            throw new Error(
                `You are trying to get proxy offscreen service "${this.name}" from offscreen. You can get original offscreen service instead`
            );
        }

        return super.get();
    }
}
