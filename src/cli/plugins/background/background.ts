import {getBackgroundOptions} from "@cli/parsers/entrypoint";

import {getAppsPath, getSharedPath} from "@cli/resolvers/path";

import {findBackgroundFiles} from "@cli/utils/entrypoint";
import {processPluginHandler} from "@cli/utils/plugin";
import {isValidEntrypointOptions} from "@cli/utils/option";

import {BackgroundConfig, BackgroundEntrypointMap} from "@typing/background";
import {ReadonlyConfig} from "@typing/config";

const backgroundFilesToEntries = (files: string[]): BackgroundEntrypointMap => {
    const entries: BackgroundEntrypointMap = new Map;

    for (const file of files) {
        entries.set(file, getBackgroundOptions(file));
    }

    return entries;
}

const findBackgroundEntriesByDir = (dir: string): BackgroundEntrypointMap => {
    return backgroundFilesToEntries(findBackgroundFiles(dir));
}

const getBackgroundEntries = async (config: ReadonlyConfig): Promise<BackgroundEntrypointMap> => {
    let entries: BackgroundEntrypointMap = new Map;

    const appBackgroundEntries = findBackgroundEntriesByDir(getAppsPath(config));

    if (appBackgroundEntries.size > 0) {
        entries = new Map([...entries, ...appBackgroundEntries]);

        if (config.debug) {
            console.info('App background added:', appBackgroundEntries);
        }
    }

    if (appBackgroundEntries.size > 0 && config.mergeBackground || appBackgroundEntries.size === 0) {
        const sharedBackgroundEntries = findBackgroundEntriesByDir(getSharedPath(config));

        if (sharedBackgroundEntries.size > 0) {
            entries = new Map([...entries, ...sharedBackgroundEntries]);

            if (config.debug) {
                console.info('Shared background added:', sharedBackgroundEntries);
            }
        }
    }

    const pluginBackgroundFiles = await Array.fromAsync(processPluginHandler(config, 'background', {
        config,
        entries
    }));

    if (pluginBackgroundFiles.length > 0) {
        const pluginBackgroundEntries = backgroundFilesToEntries(pluginBackgroundFiles);

        entries = new Map([...entries, ...pluginBackgroundEntries]);

        if (config.debug) {
            console.info('Plugin background added:', pluginBackgroundEntries);
        }
    }

    return entries;
}

export interface BackgroundResult extends Partial<BackgroundConfig> {
    files: string[];
}

export default async (config: ReadonlyConfig): Promise<BackgroundResult> => {
    const entries = Array.from(await getBackgroundEntries(config))
        .filter(([_, options]) => isValidEntrypointOptions(options, config))

    const files = entries.map(([file]) => file);
    const persistent = entries.some(([_, {persistent}]) => persistent);

    return {files, persistent}
}