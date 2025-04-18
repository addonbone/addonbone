import BackgroundEntry from "./BackgroundEntry";

import {BackgroundFinder} from "@cli/entrypoint";

import {BackgroundEntrypointOptions} from "@typing/background";

export default class extends BackgroundFinder {

    public async isPersistent(): Promise<boolean> {
        const options = await this.plugin().options();

        return Array.from(options.values()).some(({persistent}) => persistent);
    }

    public entry(): BackgroundEntry<BackgroundEntrypointOptions> {
        return new BackgroundEntry(this);
    }
}