import _ from "lodash";

import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@core/define";
import {virtualBackgroundModule, virtualCommandModule, virtualServiceModule} from "@cli/virtual";

import {EntrypointPlugin} from "@cli/bundler";

import Background from "./Background";
import Command from "./Command";
import Service from "./Service";
import BackgroundEntry from "./BackgroundEntry";
import BackgroundManifest from "./BackgroundManifest";

import {Command as AppCommand} from "@typing/app";

export {Background, Command, Service};

export default definePlugin(() => {
    let background: Background;
    let command: Command;
    let service: Service;

    return {
        name: 'adnbn:background',
        startup: async ({config}) => {
            background = new Background(config);
            command = new Command(config);
            service = new Service(config);
        },
        background: () => background.files(),
        command: () => command.files(),
        service: () => service.files(),
        bundler: async ({config, rspack}) => {
            if (await background.empty() && await command.empty() && await service.empty()) {
                if (config.debug) {
                    console.warn('Background, command or service entries not found');
                }

                return {};
            }

            // Prepare the background, command and service entries
            await command.commands();
            await service.services();

            const backgroundPlugin = EntrypointPlugin.from(await background.entry().entries())
                .virtual(file => virtualBackgroundModule(file));

            const commandPlugin = EntrypointPlugin.from(await command.entry().entries())
                .virtual((file) => {
                    const name = command.get(file)?.name;

                    if (!name) {
                        throw new Error('Command name is not defined');
                    }

                    return virtualCommandModule(file, name);
                });

            const servicePlugin = EntrypointPlugin.from(await service.entry().entries())
                .virtual(file => {
                    const name = service.get(file)?.name;

                    if (!name) {
                        throw new Error('Service name is not defined');
                    }

                    return virtualServiceModule(file, name);
                });

            if (config.command === AppCommand.Watch) {
                backgroundPlugin.watch(() => background.clear().entry().entries());

                commandPlugin.watch(async () => {
                    // Clear the command cache
                    await command.clear().commands();

                    return command.entry().entries();
                });

                servicePlugin.watch(async () => {
                    // Clear the service cache
                    await service.clear().services();

                    return service.entry().entries();
                });
            }

            return {
                plugins: [backgroundPlugin, commandPlugin, servicePlugin],
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
            const mft = new BackgroundManifest()
                .add(background.entry())
                .add(command.entry())
                .add(service.entry());

            manifest
                .setBackground(await mft.hasBackground() ? {
                    entry: BackgroundEntry.name,
                    persistent: await mft.isPersistent(),
                } : undefined)
                .setCommands(await command.manifest());
        }
    };
});