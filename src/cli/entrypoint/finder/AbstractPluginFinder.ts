import AbstractEntrypointFinder from "./AbstractEntrypointFinder";

import {EntrypointFile, EntrypointOptions, EntrypointOptionsFinder} from "@typing/entrypoint";

export default abstract class<O extends EntrypointOptions> extends AbstractEntrypointFinder<O> {
    protected _plugin?: EntrypointOptionsFinder<O>;

    protected abstract getPlugin(): EntrypointOptionsFinder<O>;

    public plugin(): EntrypointOptionsFinder<O> {
        return this._plugin ??= this.getPlugin();
    }

    async empty(): Promise<boolean> {
        return this.plugin().empty();
    }

    public clear(): this {
        this.plugin().clear();

        return super.clear();
    }

    public holds(file: EntrypointFile): boolean {
        return this.plugin().holds(file);
    }
}