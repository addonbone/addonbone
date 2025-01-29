import _map from "lodash/map";
import _mapKeys from "lodash/mapKeys";
import _snakeCase from "lodash/snakeCase";

import {CoreManifest, Manifest, ManifestBuilder, ManifestVersion} from "@typing/manifest";
import {ContentScript} from "@typing/content";

export default abstract class<T extends CoreManifest> implements ManifestBuilder<T> {
    protected appVersion: string = "0.0.0";
    protected background: string | null = null;
    protected contentScripts: ContentScript[] = [];

    public abstract getVersion(): ManifestVersion;

    public resetBackground(src: string): this {
        this.background = src;

        return this;
    }

    public pushContentScript(...content: ContentScript[]): this {
        this.contentScripts.push(...content);

        return this;
    }

    public build(): T {
        const manifest: Manifest = {
            name: '__MSG_app_name__',
            short_name: '__MSG_app_short_name__',
            description: '__MSG_app_description__',
            version: this.appVersion,
            manifest_version: this.getVersion(),
        };

        if (this.contentScripts.length > 0) {
            manifest.content_scripts = _map(this.contentScripts, (content) => {
                return _mapKeys(content, (_, key) => _snakeCase(key));
            });
        }

        return manifest as T;
    }

    public get(): T {
        return this.build();
    }
}