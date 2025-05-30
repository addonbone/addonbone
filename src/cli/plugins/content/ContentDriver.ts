import {ContentDriver, ContentItems} from "./types";

import {AbstractPluginFinder, InlineNameGenerator} from "@cli/entrypoint";

import {ContentScriptEntrypointOptions} from "@typing/content";
import {EntrypointNameGenerator} from "@typing/entrypoint";

export default class<O extends ContentScriptEntrypointOptions> implements ContentDriver<O> {
    protected _items?: ContentItems<O>;

    protected readonly itemNames: EntrypointNameGenerator;

    constructor(
        protected readonly finder: AbstractPluginFinder<O>
    ) {
        this.itemNames = new InlineNameGenerator(this.finder.type());
    }

    protected async getItems(): Promise<ContentItems<O>> {
        const items: ContentItems<O> = new Map;

        const files = await this.finder.plugin().options();

        for (const [file, options] of files) {
            items.set(this.itemNames.file(file), {file, options});
        }

        return items;
    }

    public async items(): Promise<ContentItems<O>> {
        return this._items ??= await this.getItems();
    }

    public clear(): this {
        this._items = undefined;

        this.itemNames.reset();

        return this;
    }
}