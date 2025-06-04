import TransportBuilder from "./TransportBuilder";

import Builder from "../../core/Builder";

import {RelayUnresolvedDefinition} from "@typing/relay";
import {TransportType} from "@typing/transport";
import {ContentScriptBuilder} from "@typing/content";

export default abstract class<T extends TransportType> extends Builder {
    protected readonly transport: TransportBuilder<T>;
    protected readonly content: ContentScriptBuilder;

    protected abstract contentBuilder(): ContentScriptBuilder;

    protected constructor(protected readonly definition: RelayUnresolvedDefinition<T>) {
        super();

        this.transport = new TransportBuilder(definition);
        this.content = this.contentBuilder();
    }

    public async build(): Promise<void> {
        await this.transport.build();
        await this.content.build();

        await this.definition.main?.(this.transport.get(), this.content.getContext(), this.definition);
    }

    public async destroy(): Promise<void> {
        await this.transport.destroy();
        await this.content.destroy();
    }
}