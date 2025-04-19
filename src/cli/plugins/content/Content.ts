import {ContentFinder} from "@cli/entrypoint";

import {ReadonlyConfig} from "@typing/config";
import {EntrypointEntries} from "@typing/entrypoint";
import {ManifestContentScripts} from "@typing/manifest";
import {ContentScriptEntrypointOptions} from "@typing/content";

export default class extends ContentFinder {
    public constructor(config: ReadonlyConfig) {
        super(config);

        this.names.reserve(this.getFrameworkEntry());
    }

    public getFrameworkEntry(): string {
        return 'framework.' + this.type();
    }

    public async entries(): Promise<EntrypointEntries> {
        const entries: EntrypointEntries = new Map;

        for (const [entry, items] of await this.content()) {
            entries.set(entry, new Set(Array.from(items, ({file}) => file)));
        }

        return entries;
    }

    public async manifest(): Promise<ManifestContentScripts> {
        const manifest: ManifestContentScripts = new Set;

        for (const [entry, items] of await this.content()) {
            const {
                includeApp,
                excludeApp,
                includeBrowser,
                excludeBrowser,
                ...options
            } = Array.from(items, ({options}) => options)
                .reduce((acc, opt) => {
                    return {...acc, ...opt};
                }, {} as ContentScriptEntrypointOptions);

            manifest.add({entry, ...options});
        }

        return manifest;
    }
}