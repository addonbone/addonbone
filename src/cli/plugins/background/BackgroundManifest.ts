import BackgroundEntry from "./BackgroundEntry";

import {BackgroundEntrypointOptions} from "@typing/background";
import {ManifestPermissions} from "@typing/manifest";

export default class {
    protected entries = new Set<BackgroundEntry<BackgroundEntrypointOptions>>;

    public add(entry: BackgroundEntry<BackgroundEntrypointOptions>): this {
        this.entries.add(entry);

        return this;
    }

    public async hasBackground(): Promise<boolean> {
        for await (const entry of this.entries) {
            if (await entry.finder.exists()) {
                return true;
            }
        }

        return false;
    }

    public async isPersistent(): Promise<boolean> {
        for await (const entry of this.entries) {
            if (await entry.isPersistent()) {
                return true;
            }
        }

        return false;
    }

    public async getPermissions(): Promise<ManifestPermissions> {
        const permissions: ManifestPermissions = new Set;

        for await (const entry of this.entries) {
            const entryPermissions = await entry.getPermissions();

            entryPermissions.forEach(permission => permissions.add(permission));
        }

        return permissions;
    }
}