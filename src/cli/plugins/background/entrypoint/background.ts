
import {getPluginEntrypointFiles} from "@cli/resolvers/plugin";
import {getBackgroundOptions} from "@cli/resolvers/entrypoint";
import {isValidEntrypointOptions} from "@cli/utils/option";

import {EntrypointFile} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";
import {BackgroundEntrypointMap} from "@typing/background";


const backgroundFilesToEntries = (files: Set<EntrypointFile>): BackgroundEntrypointMap => {
    const entries: BackgroundEntrypointMap = new Map;

    for (const file of files) {
        entries.set(file, getBackgroundOptions(file.file));
    }

    return entries;
}

export default async (config: ReadonlyConfig): Promise<BackgroundEntrypointMap> => {
    let entries: BackgroundEntrypointMap = new Map;

    const pluginBackgroundFiles = await getPluginEntrypointFiles(config, 'background');

    if (pluginBackgroundFiles.size > 0) {
        const pluginBackgroundEntries = backgroundFilesToEntries(pluginBackgroundFiles);

        entries = new Map(
            [...pluginBackgroundEntries]
                .filter(([_, options]) => isValidEntrypointOptions(options, config))
        );

        if (config.debug) {
            console.info('Plugin background entries:', pluginBackgroundEntries);
        }
    }

    return entries;
}