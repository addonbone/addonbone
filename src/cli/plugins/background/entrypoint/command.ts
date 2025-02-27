import {getPluginEntrypointFiles} from "@cli/resolvers/plugin";
import {getCommandOptions} from "@cli/resolvers/entrypoint";
import {isValidEntrypointOptions} from "@cli/utils/option";

import {EntrypointFile} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";
import {CommandEntrypointMap} from "@typing/command";


const registeredCommands = new Set<string>();

const generateUniqueName = (name: string): string => {
    let commandName = name;
    let counter = 1;

    while (registeredCommands.has(commandName)) {
        commandName = `${name}${counter}`;
        counter++;
    }

    registeredCommands.add(commandName);

    return commandName;
}

const extractNameFromFile = (file: EntrypointFile): string => {
    const fileName = file.file.split('/').pop() ?? '';

    const commandName = fileName.match(/^index\.(ts|tsx)$/) ? 'command' : fileName.replace(/\.command\.(ts|tsx)$/, '').replace(/\.(ts|tsx)$/, '');

    return generateUniqueName(commandName ?? 'command');
}

const commandFilesToEntries = (files: Set<EntrypointFile>): CommandEntrypointMap => {
    const entries: CommandEntrypointMap = new Map;

    for (const file of files) {
        const {name, ...options} = getCommandOptions(file.file);

        entries.set(file, {
            name: name ? generateUniqueName(name) : extractNameFromFile(file),
            ...options,
        });
    }

    registeredCommands.clear();

    return entries;
}

export default async (config: ReadonlyConfig): Promise<CommandEntrypointMap> => {
    let entries: CommandEntrypointMap = new Map;

    const pluginCommandFiles = await getPluginEntrypointFiles(config, 'command');

    if (pluginCommandFiles.size > 0) {
        const pluginCommandEntries = commandFilesToEntries(pluginCommandFiles);

        entries = new Map(
            [...pluginCommandEntries]
                .filter(([_, options]) => isValidEntrypointOptions(options, config))
        );

        if (config.debug) {
            console.info('Plugin command entries:', pluginCommandEntries);
        }
    }

    return entries;
}