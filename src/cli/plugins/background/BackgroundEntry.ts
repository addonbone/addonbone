import {AbstractPluginFinder} from "@cli/entrypoint";
import {EntrypointEntries, EntrypointOptions} from "@typing/entrypoint";

export default class BackgroundEntry<O extends EntrypointOptions> {
    public static readonly name: string = 'background';

    constructor(protected readonly finder: AbstractPluginFinder<O>) {
    }

    public async entries(): Promise<EntrypointEntries> {
        return new Map([
            [BackgroundEntry.name, await this.finder.plugin().files()]
        ]);
    }
}