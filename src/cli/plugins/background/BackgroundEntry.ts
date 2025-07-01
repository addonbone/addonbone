import {AbstractPluginFinder} from "@cli/entrypoint";

import {EntrypointEntries} from "@typing/entrypoint";
import {BackgroundEntrypointOptions, BackgroundEntryName} from "@typing/background";
import {ManifestPermissions} from "@typing/manifest";

export default class BackgroundEntry<O extends BackgroundEntrypointOptions> {
    public static readonly name: string = BackgroundEntryName;

    constructor(public readonly finder: AbstractPluginFinder<O>) {
    }

    public async entries(): Promise<EntrypointEntries> {
        const options = await this.finder.plugin().options();

        return new Map([
            [BackgroundEntry.name, new Set(options.keys())]
        ]);
    }

    public async isPersistent(): Promise<boolean> {
        const options = await this.finder.plugin().options();

        return Array.from(options.values()).some(({persistent}) => persistent);
    }

    public async getPermissions(): Promise<ManifestPermissions> {
        const options = await this.finder.plugin().options();

        const permissions: ManifestPermissions = new Set;

        for await (const entry of options.values()) {
            if (entry.permissions && entry.permissions.length > 0) {
                entry.permissions.forEach(permission => permissions.add(permission));
            }
        }

        return permissions;
    }
}