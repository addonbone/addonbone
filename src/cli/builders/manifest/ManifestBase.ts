import {
    CoreManifest,
    Manifest,
    ManifestBackground,
    ManifestBuilder,
    ManifestContentScript,
    ManifestVersion
} from "@typing/manifest";

import {Browser} from "@typing/config";

export default abstract class<T extends CoreManifest> implements ManifestBuilder<T> {
    protected name: string = "__MSG_app_name__";
    protected shortName: string = "__MSG_app_short_name__";
    protected description: string = "__MSG_app_description__";
    protected version: string = "0.0.0";
    protected background?: ManifestBackground;
    protected contentScripts: Map<string, ManifestContentScript> = new Map();

    public abstract getManifestVersion(): ManifestVersion;

    protected abstract buildBackground(): Partial<T> | undefined;

    protected abstract buildContentScripts(): Partial<T> | undefined;

    protected constructor(protected readonly browser: Browser = Browser.Chrome) {
    }

    public setName(name: string): this {
        this.name = name;

        return this;
    }

    public setShortName(shortName: string): this {
        this.shortName = shortName;

        return this;
    }

    public setDescription(description: string): this {
        this.description = description;

        return this;
    }

    public setVersion(version: string): this {
        this.version = version;

        return this;
    }

    public resetBackground(background: ManifestBackground): this {
        this.background = background;

        return this;
    }

    public pushContentScript(...content: ManifestContentScript[]): this {
        for (const script of content) {
            this.contentScripts.set(script.entry, script);
        }

        return this;
    }

    private marge<T extends CoreManifest>(manifest: T, ...sources: Array<Partial<T> | undefined>): T {
        sources = sources.filter((source) => source !== undefined);

        if (sources.length === 0) {
            return manifest;
        }

        return {...manifest, ...sources};
    }

    public build(): T {
        let manifest: Manifest = {
            name: this.name,
            short_name: this.shortName,
            description: this.description,
            version: this.version,
            manifest_version: this.getManifestVersion(),
        };

        manifest = this.marge(manifest, this.buildBackground(), this.buildContentScripts());

        return manifest as T;
    }

    public get(): T {
        return this.build();
    }
}