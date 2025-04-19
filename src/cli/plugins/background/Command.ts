import BackgroundEntry from "./BackgroundEntry";

import {CommandFinder} from "@cli/entrypoint";

import {CommandConfig, CommandEntrypointOptions} from "@typing/command";
import {ManifestCommand, ManifestCommands} from "@typing/manifest";
import {EntrypointFile} from "@typing/entrypoint";

export default class Command extends CommandFinder {
    public entry(): BackgroundEntry<CommandEntrypointOptions> {
        return new BackgroundEntry(this);
    }

    public get(file: EntrypointFile): CommandConfig | undefined {
        return this._commands?.get(file);
    }

    public async manifest(): Promise<ManifestCommands | undefined> {
        if (await this.empty()) {
            return undefined;
        }

        const options = await this.commands();

        return new Set<ManifestCommand>(options.values());
    }
}