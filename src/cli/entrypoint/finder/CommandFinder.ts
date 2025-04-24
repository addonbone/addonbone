import AbstractPluginFinder from "./AbstractPluginFinder";
import PluginFinder from "./PluginFinder";

import {CommandParser} from "../parser";
import {InlineNameGenerator} from "../name";

import {ReadonlyConfig} from "@typing/config";
import {CommandEntrypointOptions, CommandOptions} from "@typing/command";
import {EntrypointFile, EntrypointOptionsFinder, EntrypointParser, EntrypointType} from "@typing/entrypoint";


export default class extends AbstractPluginFinder<CommandEntrypointOptions> {
    protected _commands?: Map<EntrypointFile, CommandOptions>;

    protected readonly names: InlineNameGenerator;

    public constructor(config: ReadonlyConfig) {
        super(config);

        this.names = new InlineNameGenerator(this.type());
    }

    public type(): EntrypointType {
        return EntrypointType.Command;
    }

    protected getParser(): EntrypointParser<CommandEntrypointOptions> {
        return new CommandParser();
    }

    protected getPlugin(): EntrypointOptionsFinder<CommandEntrypointOptions> {
        return new PluginFinder(this.config, 'command', this);
    }

    protected async getCommands(): Promise<Map<EntrypointFile, CommandOptions>> {
        const options = new Map<EntrypointFile, CommandOptions>();

        for (const [file, option] of await this.plugin().options()) {
            const {name, ...definition} = option;

            options.set(file, {
                name: name ? this.names.name(name) : this.names.file(file),
                ...definition,
            });
        }

        return options;
    }

    public async commands(): Promise<Map<EntrypointFile, CommandOptions>> {
       return this._commands ??= await this.getCommands();
    }

    public canMerge(): boolean {
        return this.config.mergeCommands;
    }

    public clear(): this {
        this.names.reset();

        this._commands = undefined;

        return super.clear();
    }
}