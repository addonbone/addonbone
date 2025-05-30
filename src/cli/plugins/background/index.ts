import _ from "lodash";

import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@main/plugin";
import {virtualBackgroundModule} from "@cli/virtual";

import {EntrypointPlugin} from "@cli/bundler";

import Background from "./Background";
import BackgroundEntry from "./BackgroundEntry";
import BackgroundManifest from "./BackgroundManifest";
import Command from "./Command";
import Service from "./Service";

import {ServiceDeclaration} from "./declaration";

import {Command as AppCommand} from "@typing/app";

export {Background, Command, Service};

export default definePlugin(() => {
    let background: Background;
    let command: Command;
    let service: Service;
    let serviceDeclaration: ServiceDeclaration;

    return {
        name: 'adnbn:background',
        startup: async ({config}) => {
            background = new Background(config);
            command = new Command(config);
            service = new Service(config);
            serviceDeclaration = new ServiceDeclaration(config);
        },
        background: () => background.files(),
        command: () => command.files(),
        service: () => service.files(),
        bundler: async ({config, rspack}) => {
            serviceDeclaration.dictionary(await service.dictionary()).build();

            if (await background.empty() && await command.empty() && await service.empty()) {
                if (config.debug) {
                    console.warn('Background, command or service entries not found');
                }

                return {};
            }

            const backgroundPlugin = EntrypointPlugin.from(await background.entry().entries())
                .virtual(file => virtualBackgroundModule(file));

            const commandPlugin = EntrypointPlugin.from(await command.entry().entries())
                .virtual((file) => command.virtual(file));

            const servicePlugin = EntrypointPlugin.from(await service.entry().entries())
                .virtual(file => service.virtual(file));

            if (config.command === AppCommand.Watch) {
                backgroundPlugin.watch(() => background.clear().entry().entries());

                commandPlugin.watch(async () => {
                    // Clear the command cache
                    await command.clear().commands();

                    return command.entry().entries();
                });

                servicePlugin.watch(async () => {
                    serviceDeclaration.dictionary(await service.clear().dictionary()).build();

                    return service.entry().entries();
                });
            }

            return {
                plugins: [servicePlugin, commandPlugin, backgroundPlugin],
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

            const permissions = await mft.getPermissions();

            if (permissions.size > 0) {
                manifest.appendPermissions(permissions);
            }
        }
    };
});