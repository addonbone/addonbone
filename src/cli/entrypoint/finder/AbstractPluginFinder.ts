import EntrypointFinder from "./EntrypointFinder";

import {EntrypointOptions, EntrypointOptionsFinder} from "@typing/entrypoint";

export default abstract class<O extends EntrypointOptions> extends EntrypointFinder<O> {
    protected _plugin?: EntrypointOptionsFinder<O>;

    protected abstract getPlugin(): EntrypointOptionsFinder<O>;

    public plugin(): EntrypointOptionsFinder<O> {
        if (this._plugin) {
            return this._plugin;
        }

        return this._plugin = this.getPlugin();
    }

    public clear(): this {
        this.plugin().clear();

        return super.clear();
    }

    async empty(): Promise<boolean> {
        return this.plugin().empty();
    }

    async exists(): Promise<boolean> {
        return this.plugin().exists();
    }
}