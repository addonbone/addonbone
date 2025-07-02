import BackgroundEntry from "./BackgroundEntry";

import {BackgroundFinder} from "@cli/entrypoint";

import {BackgroundEntrypointOptions} from "@typing/background";

export default class extends BackgroundFinder {
    public entry(): BackgroundEntry<BackgroundEntrypointOptions> {
        return new BackgroundEntry(this);
    }
}
