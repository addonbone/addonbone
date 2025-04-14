import _ from "lodash";

import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@core/define";
import {virtualBackgroundModule, virtualCommandModule} from "@cli/virtual";
import {getBackgroundOptions, getCommandOptions, InlineNameGenerator, isValidEntrypointOptions} from "@cli/entrypoint";

import EntrypointPlugin, {EntrypointPluginEntries} from "@cli/bundler/plugins/EntrypointPlugin";

import {getEntrypointFiles} from "@cli/resolvers/entrypoint";
import {getPluginEntrypointFiles} from "@cli/resolvers/plugin";

import {BackgroundDefinition} from "@typing/background";
import {Command} from "@typing/app";
import {EntrypointFile, EntrypointType} from "@typing/entrypoint";
import {CommandOptions} from "@typing/command";
import {ManifestCommand, ManifestCommands} from "@typing/manifest";
import {ReadonlyConfig} from "@typing/config";

type BackgroundEntrypointMap = Map<EntrypointFile, BackgroundDefinition>;
type CommandEntrypointMap = Map<EntrypointFile, CommandOptions>;

const name = 'background';

const commandNameGenerator = new InlineNameGenerator(EntrypointType.Command);

const getBackgroundEntrypoint = async (config: ReadonlyConfig): Promise<BackgroundEntrypointMap> => {
    const entries: BackgroundEntrypointMap = new Map;

    const pluginBackgroundFiles = await getPluginEntrypointFiles(config, 'background');

    if (pluginBackgroundFiles.size > 0) {
        for (const file of pluginBackgroundFiles) {
            const options = getBackgroundOptions(file);

            if (!isValidEntrypointOptions(options, config)) {
                continue;
            }

            entries.set(file, options);
        }

        if (config.debug) {
            console.info('Plugin background entries:', entries);
        }
    }

    return entries;
}

const getCommandEntrypoint = async (config: ReadonlyConfig): Promise<CommandEntrypointMap> => {
    const entries: CommandEntrypointMap = new Map;

    const pluginCommandFiles = await getPluginEntrypointFiles(config, 'command');

    if (pluginCommandFiles.size > 0) {
        for (const file of pluginCommandFiles) {
            const options = getCommandOptions(file);

            if (!isValidEntrypointOptions(options, config)) {
                continue;
            }

            const {name, ...definition} = getCommandOptions(file);

            entries.set(file, {
                name: name ? commandNameGenerator.name(name) : commandNameGenerator.file(file),
                ...definition,
            });
        }

        if (config.debug) {
            console.info('Plugin command entries:', entries);
        }
    }

    commandNameGenerator.reset();

    return entries;
}

const isPersistent = (background?: BackgroundEntrypointMap): boolean => {
    if (!background) {
        return false;
    }

    return Array.from(background.values()).some(({persistent}) => persistent);
}

const getCommands = (command?: CommandEntrypointMap): ManifestCommands | undefined => {
    if (!command || command.size === 0) {
        return undefined;
    }

    return new Set<ManifestCommand>(command.values());
}

const getEntry = (entrypoint: BackgroundEntrypointMap | CommandEntrypointMap): EntrypointPluginEntries => {
    return {[name]: Array.from(entrypoint.keys())};
}

export default definePlugin(() => {
    let backgroundEntrypoint: BackgroundEntrypointMap | undefined;
    let commandEntrypoint: CommandEntrypointMap | undefined;

    return {
        name: 'adnbn:background',
        background: ({config}) => getEntrypointFiles(config, EntrypointType.Background),
        command: ({config}) => getEntrypointFiles(config, EntrypointType.Command),
        bundler: async ({config, rspack}) => {
            backgroundEntrypoint = await getBackgroundEntrypoint(config);
            commandEntrypoint = await getCommandEntrypoint(config);

            if (backgroundEntrypoint.size === 0 && commandEntrypoint.size === 0) {
                if (config.debug) {
                    console.warn('Background or command entries not found');
                }

                return {};
            }

            const backgroundEntrypointPlugin = (new EntrypointPlugin(getEntry(backgroundEntrypoint)))
                .virtual(file => virtualBackgroundModule(file));

            const commandEntrypointPlugin = (new EntrypointPlugin(getEntry(commandEntrypoint)))
                .virtual(file => {
                    if (!commandEntrypoint) {
                        throw new Error('Command entrypoint is not defined');
                    }

                    const name = commandEntrypoint.get(file)?.name;

                    if (!name) {
                        throw new Error('Command name is not defined');
                    }

                    return virtualCommandModule(file, name);
                });

            if (config.command === Command.Watch) {
                backgroundEntrypointPlugin.watch(async () => {
                    backgroundEntrypoint = await getBackgroundEntrypoint(config);

                    return getEntry(backgroundEntrypoint);
                });

                commandEntrypointPlugin.watch(async () => {
                    commandEntrypoint = await getCommandEntrypoint(config);

                    return getEntry(commandEntrypoint);
                });
            }

            return {
                plugins: [backgroundEntrypointPlugin, commandEntrypointPlugin],
                optimization: {
                    splitChunks: {
                        chunks(chunk) {
                            const {chunks} = rspack.optimization?.splitChunks || {};

                            if (_.isFunction(chunks) && !chunks(chunk)) {
                                return false;
                            }

                            return chunk.name !== name;
                        },
                    }
                }
            } satisfies RspackConfig;
        },
        manifest: ({manifest}) => {
            manifest
                .setBackground(backgroundEntrypoint || commandEntrypoint ? {
                    entry: name,
                    persistent: isPersistent(backgroundEntrypoint),
                } : undefined)
                .setCommands(getCommands(commandEntrypoint));
        }
    };
});