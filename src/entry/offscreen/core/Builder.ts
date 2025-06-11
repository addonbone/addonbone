import TransportBuilder from "./TransportBuilder";

import Builder from "../../core/Builder";

import {OffscreenGlobalAccess, OffscreenUnresolvedDefinition} from "@typing/offscreen";
import {TransportType} from "@typing/transport";
import {ViewBuilder} from "@typing/view";

export default abstract class<T extends TransportType> extends Builder {
    protected readonly transport: TransportBuilder<T>;
    protected readonly view: ViewBuilder;

    protected abstract viewBuilder(): ViewBuilder;

    protected constructor(protected readonly definition: OffscreenUnresolvedDefinition<T>) {
        super();

        this.transport = new TransportBuilder(definition);
        this.view = this.viewBuilder();
    }

    public async build(): Promise<void> {
        globalThis[OffscreenGlobalAccess] = true;

        await this.transport.build();
        await this.view.build();
    }

    public async destroy(): Promise<void> {
        await this.transport.destroy();
        await this.view.destroy();
    }
}