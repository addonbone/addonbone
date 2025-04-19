import EntrypointFinder from "./EntrypointFinder";

import {EntrypointFinder as EntrypointFinderContract, EntrypointOptions} from "@typing/entrypoint";

export default abstract class<O extends EntrypointOptions> extends EntrypointFinder<O> {
    protected _plugin?: EntrypointFinderContract<O>;

    protected abstract getPlugin(): EntrypointFinderContract<O>;

    public plugin(): EntrypointFinderContract<O> {
        if (this._plugin) {
            return this._plugin;
        }

        return this._plugin = this.getPlugin();
    }

    public clear(): this {
        this.plugin().clear();

        return super.clear();
    }
}