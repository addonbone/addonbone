import path from "path";

import AbstractPluginFinder from "./AbstractPluginFinder";

import {InlineNameGenerator} from "../name";

import {ReadonlyConfig} from "@typing/config";
import {EntrypointFile} from "@typing/entrypoint";
import {TransportEntrypointOptions, TransportOptions} from "@typing/transport";

export interface TransportItem<O extends TransportOptions> {
    options: O;
    contract: string | undefined;
}

export type TransportItems<O extends TransportOptions> = Map<EntrypointFile, TransportItem<O>>;

export default abstract class<
    O extends TransportEntrypointOptions,
    T extends TransportOptions = TransportOptions,
> extends AbstractPluginFinder<O> {
    protected _transport?: TransportItems<T>;

    protected readonly names: InlineNameGenerator;

    protected constructor(config: ReadonlyConfig) {
        super(config);

        this.names = new InlineNameGenerator(this.type());
    }

    protected async getTransport(): Promise<TransportItems<T>> {
        const transport: TransportItems<T> = new Map();

        const contracts = await this.plugin().contracts();

        for (const [file, option] of await this.plugin().options()) {
            const {name: _name, ...definition} = option;

            let name: string;

            if (file.external) {
                name = _name ? path.posix.join(file.external, _name) : file.import;

                if (this.names.has(name)) {
                    throw new Error(`Transport name "${name}" for "${this.type()}" is already in use.`);
                }

                name = this.names.name(name);
            } else if (_name) {
                name = this.names.name(_name);
            } else {
                name = this.names.file(file);
            }

            transport.set(file, {
                options: {
                    name,
                    ...definition,
                } as TransportOptions as T,
                contract: contracts.get(file),
            });
        }

        return transport;
    }

    public async transport(): Promise<TransportItems<T>> {
        return (this._transport ??= await this.getTransport());
    }

    public async dictionary(): Promise<Record<string, string>> {
        const transport = await this.transport();

        return transport.values().reduce(
            (dictionary, item) => {
                return {...dictionary, [item.options.name]: item.contract || "any"};
            },
            {} as Record<string, string>
        );
    }

    public clear(): this {
        this.names.reset();

        this._transport = undefined;

        return super.clear();
    }
}
