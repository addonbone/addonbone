import {View} from "../view";

import {PageFinder} from "@cli/entrypoint";
import {ReadonlyConfig} from "@typing/config";
import {PageEntrypointOptions} from "@typing/page";
import {ManifestAccessibleResources} from "@typing/manifest";

export default class extends PageFinder {
    protected _view?: View<PageEntrypointOptions>;

    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public view(): View<PageEntrypointOptions> {
        return this._view ??= new View(this.config, this);
    }

    public async manifest(): Promise<ManifestAccessibleResources> {
        const resources: ManifestAccessibleResources = new Set;

        const views = await this.views();

        for (const {filename, options} of views.values()) {
            const {matches} = options;

            if (!matches) {
                continue;
            }

            resources.add({resources: [filename], matches});
        }

        return resources;
    }

    public clear(): this {
        this._view = undefined;

        return super.clear();
    }
}