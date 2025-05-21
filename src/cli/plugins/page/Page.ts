import {View} from "../view";

import {PageFinder} from "@cli/entrypoint";
import {ReadonlyConfig} from "@typing/config";
import {PageEntrypointOptions} from "@typing/page";

export default class extends PageFinder {
    protected _view?: View<PageEntrypointOptions>;

    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public view(): View<PageEntrypointOptions> {
        return this._view ??= new View(this.config, this);
    }

    public clear(): this {
        this._view = undefined;

        return super.clear();
    }
}