import BackgroundEntry from "./BackgroundEntry";

import {ServiceFinder} from "@cli/entrypoint";
import {virtualServiceModule} from "@cli/virtual";

import {BackgroundEntrypointOptions} from "@typing/background";
import {EntrypointFile} from "@typing/entrypoint";

export default class extends ServiceFinder {
    public entry(): BackgroundEntry<BackgroundEntrypointOptions> {
        return new BackgroundEntry(this);
    }

    /**
     * Before creating the virtual module, it is necessary to run a command `await service.transport()`
     * that caches the services.
     * This command is executed during the type declaration generation stage for the service.
     */
    public virtual(file: EntrypointFile): string {
        const options = this._transport?.get(file)?.options;

        if (!options) {
            throw new Error(`Service options not found for "${file}"`);
        }

        return virtualServiceModule(file, options.name);
    }
}