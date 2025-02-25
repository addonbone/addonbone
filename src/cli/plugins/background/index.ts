import _ from "lodash";

import {Configuration as WebpackConfig} from "webpack";

import getBackgroundEntrypoint from "./entrypoint/background";
import getCommandEntrypoint from "./entrypoint/command";

import {definePlugin} from "@core/define";
import {virtualBackgroundModule, virtualCommandModule} from "@cli/virtual";

import EntrypointPlugin, {EntrypointPluginEntries} from "@cli/webpack/plugins/EntrypointPlugin";

import {getEntrypointFiles} from "@cli/resolvers/entrypoint";

import {BackgroundEntrypointMap} from "@typing/background";
import {Command} from "@typing/config";
import {EntrypointType} from "@typing/entrypoint";
import {CommandEntrypointMap} from "@typing/command";
import {ManifestCommand, ManifestCommandMap} from "@typing/manifest";

const name = 'background';

const isPersistent = (background?: BackgroundEntrypointMap): boolean => {
    if (!background) {
        return false;
    }

    return Array.from(background.values()).some(({persistent}) => persistent);
}

const getCommands = (command?: CommandEntrypointMap): ManifestCommandMap | undefined => {
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
        name: import.meta.dirname,
        background: ({config}) => getEntrypointFiles(config, EntrypointType.Background),
        command: ({config}) => getEntrypointFiles(config, EntrypointType.Command),
        webpack: async ({config, webpack}) => {
            backgroundEntrypoint = await getBackgroundEntrypoint(config);
            commandEntrypoint = await getCommandEntrypoint(config);

            if (backgroundEntrypoint.size === 0 && commandEntrypoint.size === 0) {
                if (config.debug) {
                    console.warn('Background or command entries not found');
                }

                return {};
            }

            const backgroundEntrypointPlugin = (new EntrypointPlugin(getEntry(backgroundEntrypoint), 'background-entrypoint'))
                .virtual(file => virtualBackgroundModule(file));

            const commandEntrypointPlugin = (new EntrypointPlugin(getEntry(commandEntrypoint), 'command-entrypoint'))
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

            let resolvedWebpack: WebpackConfig = {
                plugins: [backgroundEntrypointPlugin, commandEntrypointPlugin],
                optimization: {
                    splitChunks: {
                        chunks(chunk) {
                            const {chunks} = webpack.optimization?.splitChunks || {};

                            if (_.isFunction(chunks) && !chunks(chunk)) {
                                return false;
                            }

                            return chunk.name !== name;
                        },
                    }
                }
            };

            return resolvedWebpack;
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