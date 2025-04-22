import _ from "lodash";

import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@core/define";
import {virtualBackgroundModule, virtualCommandModule} from "@cli/virtual";

import {EntrypointPlugin} from "@cli/bundler";

import Background from "./Background";
import Command from "./Command";
import BackgroundEntry from "./BackgroundEntry";

import {Command as AppCommand} from "@typing/app";

export {Background, BackgroundEntry, Command};

export default definePlugin(() => {
    let background: Background;
    let command: Command;

    return {
        name: 'adnbn:background',
        startup: async ({config}) => {
            background = new Background(config);
            command = new Command(config);
        },
        background: () => background.files(),
        command: () => command.files(),
        bundler: async ({config, rspack}) => {
            if (await background.empty() && await command.empty()) {
                if (config.debug) {
                    console.warn('Background or command entries not found');
                }

                return {};
            }

            const backgroundEntrypointPlugin = EntrypointPlugin.from(await background.entry().entries())
                .virtual(file => virtualBackgroundModule(file));

            const commandEntrypointPlugin = EntrypointPlugin.from(await command.entry().entries())
                .virtual((file) => {
                    const name = command.get(file)?.name;

                    if (!name) {
                        throw new Error('Command name is not defined');
                    }

                    return virtualCommandModule(file, name);
                });

            if (config.command === AppCommand.Watch) {
                // TODO: Implement watch for background and command entrypoints

                // backgroundEntrypointPlugin.watch(async () => {
                //     backgroundEntrypoint = await getBackgroundEntrypoint(config);
                //
                //     return getEntry(backgroundEntrypoint);
                // });

                // commandEntrypointPlugin.watch(async () => {
                //     commandEntrypoint = await getCommandEntrypoint(config);
                //
                //     return getEntry(commandEntrypoint);
                // });
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

                            return chunk.name !== BackgroundEntry.name;
                        },
                    }
                }
            } satisfies RspackConfig;
        },
        manifest: async ({manifest}) => {
            manifest
                .setBackground(await background.exists() || await command.exists() ? {
                    entry: BackgroundEntry.name,
                    persistent: await background.isPersistent(),
                } : undefined)
                .setCommands(await command.manifest());
        }
    };
});