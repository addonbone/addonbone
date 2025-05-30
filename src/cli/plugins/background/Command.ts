import BackgroundEntry from "./BackgroundEntry";

import {CommandFinder} from "@cli/entrypoint";
import {virtualCommandModule} from "@cli/virtual";

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

    /**
     * Before creating the virtual module, it is necessary to run a command `await this.commands()`
     * that caches the commands.
     * This command is executed during the type declaration generation stage for the commands.
     */
    public virtual(file: EntrypointFile): string {
        const options = this._commands?.get(file);

        if (!options) {
            throw new Error(`Command options not found for "${file}"`);
        }

        return virtualCommandModule(file, options.name);
    }

    public async manifest(): Promise<ManifestCommands | undefined> {
        if (await this.empty()) {
            return undefined;
        }

        const options = await this.commands();

        return new Set<ManifestCommand>(options.values());
    }
}