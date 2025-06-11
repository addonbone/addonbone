import path from "path";

import {InlineNameGenerator, NameGenerator} from "../name";

import AbstractPluginFinder from "./AbstractPluginFinder";

import {ReadonlyConfig} from "@typing/config";
import {ViewEntrypointOptions} from "@typing/view";
import {EntrypointFile, EntrypointNameGenerator} from "@typing/entrypoint";

export interface ViewItem<O extends ViewEntrypointOptions> {
    filename: string;
    alias: string;
    file: EntrypointFile;
    options: O;
}

export type ViewItems<O extends ViewEntrypointOptions> = Map<string, ViewItem<O>>;

export default abstract class<O extends ViewEntrypointOptions> extends AbstractPluginFinder<O> {
    protected _views?: ViewItems<O>;

    protected readonly names: EntrypointNameGenerator;
    protected readonly aliases: EntrypointNameGenerator;
    protected readonly filenames: EntrypointNameGenerator;

    protected constructor(config: ReadonlyConfig) {
        super(config);

        this.names = this.createNameGenerator();
        this.aliases = this.createAliasGenerator();
        this.filenames = this.createFilenameGenerator();
    }

    protected createNameGenerator(): EntrypointNameGenerator {
        return new NameGenerator(this.type());
    }

    protected createAliasGenerator(): EntrypointNameGenerator {
        return new InlineNameGenerator(this.type());
    }

    protected createFilenameGenerator(): EntrypointNameGenerator {
        return new NameGenerator(this.type());
    }

    protected async getViews(): Promise<ViewItems<O>> {
        const views: ViewItems<O> = new Map;

        for (const [file, options] of await this.plugin().options()) {
            let {as: name} = options;

            let filename = name ? this.filenames.name(name) : this.filenames.file(file);

            filename = path.posix.join(this.config.htmlDir, filename + '.html');

            let alias = name ? this.aliases.name(name) : this.aliases.file(file);

            name = name ? this.names.name(name) : this.names.file(file);

            if (file.external) {
                alias = file.import;
            }

            views.set(name, {alias, filename, file, options});

            if (!this.allowMultiple()) {
                break;
            }
        }

        return views;
    }

    public async views(): Promise<ViewItems<O>> {
        return this._views ??= await this.getViews();
    }

    public allowMultiple(): boolean {
        return true;
    }

    public async getAliasToFilename(): Promise<Map<string, string>> {
        return Array.from(await this.views()).reduce((aliases, [_, item]) => {
            return {
                ...aliases,
                [item.alias]: item.filename,
            };
        }, {} as Map<string, string>);
    }

    public async getAlias(): Promise<Set<string>> {
        const aliases = new Set<string>();

        const views = await this.views();

        for (const item of views.values()) {
            aliases.add(item.alias);
        }

        return aliases;
    }

    public async getFilenames(): Promise<Map<EntrypointFile, string>> {
        const views = await this.views();

        const filenames = new Map<EntrypointFile, string>;

        for (const {file, filename} of views.values()) {
            filenames.set(file, filename);
        }

        return filenames;
    }

    public clear(): this {
        this._views = undefined;

        this.names.reset();
        this.aliases.reset();
        this.filenames.reset();

        return super.clear();
    }
}