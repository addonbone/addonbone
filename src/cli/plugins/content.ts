import _ from "lodash";
import stringify from "json-stringify-deterministic";

import {definePlugin} from "@core/define";
import {getPluginEntrypointFiles} from "@cli/resolvers/plugin";
import {getContentScriptOptions, getEntrypointFiles} from "@cli/resolvers/entrypoint";

import {virtualContentScriptModule} from "@cli/virtual";

import {getEntrypointName} from "@cli/utils/entrypoint";
import {isValidEntrypointOptions} from "@cli/utils/option";

import EntrypointPlugin, {EntrypointPluginEntries} from "@cli/rspack/plugins/EntrypointPlugin";

import {EntrypointFile, EntrypointType} from "@typing/entrypoint";
import {ContentScriptEntrypointMap, ContentScriptEntrypointOptions} from "@typing/content";
import {ReadonlyConfig} from "@typing/config";
import {ManifestContentScript, ManifestContentScripts} from "@typing/manifest";
import {Command} from "@typing/app";

type ContentScriptEntries = Record<string, Array<{ options: ContentScriptEntrypointOptions, file: EntrypointFile }>>;

const registeredEntryNames = new Set<string>();
const entryNameByOptions = new Map<string, string>();

const generateUniqueEntryName = (file: EntrypointFile): string => {
    let name = getEntrypointName(file, EntrypointType.ContentScript);

    let entryName = name;
    let counter = 1;

    if (entryName !== EntrypointType.ContentScript) {
        entryName = `${entryName}.${EntrypointType.ContentScript}`;
    }

    while (registeredEntryNames.has(entryName)) {
        entryName = name === EntrypointType.ContentScript ? `${counter}.${name}` : `${name}${counter}.${EntrypointType.ContentScript}`;

        counter++;
    }

    registeredEntryNames.add(entryName);

    return entryName;
}

const getContentScriptEntryName = (file: EntrypointFile, options: ContentScriptEntrypointOptions, concat: boolean = true): string => {
    const entry = generateUniqueEntryName(file);

    if (!concat) {
        return entry;
    }

    const key = stringify(options);

    const existingEntry = entryNameByOptions.get(key);

    if (existingEntry) {
        return existingEntry;
    }

    entryNameByOptions.set(key, entry);

    return entry;
}

const contentScriptFilesToEntries = (files: Set<EntrypointFile>): ContentScriptEntrypointMap => {
    const entries: ContentScriptEntrypointMap = new Map;

    const defaultOptions: ContentScriptEntrypointOptions = {
        matches: ['*://*/*'],
        runAt: 'document_idle',
    };

    for (const file of files) {
        entries.set(file, {...defaultOptions, ...getContentScriptOptions(file)});
    }

    return entries;
}

const getContentScriptEntries = async (config: ReadonlyConfig): Promise<ContentScriptEntries> => {
    let entries: ContentScriptEntries = {};

    const pluginContentScriptFiles = await getPluginEntrypointFiles(config, 'content');

    if (pluginContentScriptFiles.size > 0) {
        const pluginContentScriptEntries = contentScriptFilesToEntries(pluginContentScriptFiles);

        entries = _.chain([...pluginContentScriptEntries])
            .filter(([_, options]) => isValidEntrypointOptions(options, config))
            .map(([file, options]) => ({file, options}))
            .groupBy(({file, options}) => getContentScriptEntryName(file, options, config.concatContentScripts))
            .value();
    }

    registeredEntryNames.clear();
    entryNameByOptions.clear();

    return entries;
}

const contentScriptEntryForPlugin = (entries: ContentScriptEntries): EntrypointPluginEntries => {
    return _.mapValues(entries, (files) => files.map(({file}) => file));
}

const contentScriptForManifest = (entries: ContentScriptEntries): ManifestContentScripts => {
    const scripts = _.map(entries, (items, entry): ManifestContentScript => {
        const {includeApp, excludeApp, includeBrowser, excludeBrowser, ...options} = items
            .map(({options}) => options)
            .reduce((acc, opts) => ({...acc, ...opts}), {} as ContentScriptEntrypointOptions);

        return {entry, ...options};
    });

    return new Set(scripts);
}

export default definePlugin(() => {
    let contentScriptEntries: ContentScriptEntries;

    return {
        name: 'adnbn:content',
        content: ({config}) => getEntrypointFiles(config, EntrypointType.ContentScript),
        rspack: async ({config}) => {
            contentScriptEntries = await getContentScriptEntries(config);

            if (_.isEmpty(contentScriptEntries)) {
                if (config.debug) {
                    console.warn('Content script entries not found');
                }

                return {};
            }

            const contentEntrypointPlugin = (new EntrypointPlugin(contentScriptEntryForPlugin(contentScriptEntries), 'content-entrypoint'))
                .virtual(file => virtualContentScriptModule(file));

            if (config.command === Command.Watch) {
                contentEntrypointPlugin.watch(async () => {
                    contentScriptEntries = await getContentScriptEntries(config);

                    return contentScriptEntryForPlugin(contentScriptEntries);
                });
            }

            return {plugins: [contentEntrypointPlugin]};
        },
        manifest: ({manifest}) => {
            manifest.setContentScripts(contentScriptForManifest(contentScriptEntries));
        }
    };
});