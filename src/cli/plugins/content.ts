import _ from "lodash";
import path from "path";
import stringify from "json-stringify-deterministic";
import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@core/define";
import {getContentScriptOptions, isValidEntrypointOptions, NameGenerator} from "@cli/entrypoint";

import {getPluginEntrypointFiles} from "@cli/resolvers/plugin";
import {getEntrypointFiles} from "@cli/resolvers/entrypoint";

import {virtualContentScriptModule} from "@cli/virtual";

import EntrypointPlugin, {EntrypointPluginEntries} from "@cli/bundler/plugins/EntrypointPlugin";

import {EntrypointFile, EntrypointType} from "@typing/entrypoint";
import {ContentScriptEntrypointOptions} from "@typing/content";
import {ReadonlyConfig} from "@typing/config";
import {ManifestContentScript, ManifestContentScripts} from "@typing/manifest";
import {Command, PackageName} from "@typing/app";

type ContentScriptEntrypointMap = Map<EntrypointFile, ContentScriptEntrypointOptions>;

type ContentScriptEntries = Record<string, Array<{ options: ContentScriptEntrypointOptions, file: EntrypointFile }>>;

const frameworkContentEntryName = 'framework.' + EntrypointType.ContentScript;

const nameGenerator = new NameGenerator(EntrypointType.ContentScript).reserve(frameworkContentEntryName);

const entryNameByOptions = new Map<string, string>();

const getContentScriptEntryName = (file: EntrypointFile, options: ContentScriptEntrypointOptions, concat: boolean = true): string => {
    const entry = nameGenerator.file(file);

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

    nameGenerator.reset();

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
        bundler: async ({config}) => {
            contentScriptEntries = await getContentScriptEntries(config);

            if (_.isEmpty(contentScriptEntries)) {
                if (config.debug) {
                    console.warn('Content script entries not found');
                }

                return {};
            }

            const contentEntrypointPlugin = (new EntrypointPlugin(contentScriptEntryForPlugin(contentScriptEntries)))
                .virtual(file => virtualContentScriptModule(file));

            if (config.command === Command.Watch) {
                contentEntrypointPlugin.watch(async () => {
                    contentScriptEntries = await getContentScriptEntries(config);

                    return contentScriptEntryForPlugin(contentScriptEntries);
                });
            }

            const rspack: RspackConfig = {
                plugins: [contentEntrypointPlugin],
                optimization: {
                    splitChunks: {
                        cacheGroups: {
                            frameworkContent: {
                                name: frameworkContentEntryName,
                                test: (module, {moduleGraph}): boolean => {
                                    const clientDirs = [
                                        path.join('node_modules', PackageName, 'entry', 'content'),
                                        path.join('addonbone', 'dist', 'entry', 'content'), // TODO: Remove this for production
                                    ];

                                    if (clientDirs.some((dir) => (module.resource || '').includes(dir))) {
                                        return true;
                                    }

                                    let issuer = moduleGraph.getIssuer(module);

                                    while (issuer) {
                                        if (clientDirs.some((dir) => (issuer?.resource || '').includes(dir))) {
                                            return true;
                                        }

                                        issuer = moduleGraph.getIssuer(issuer);
                                    }

                                    return false;
                                },
                                chunks: (chunk): boolean => {
                                    const {name} = chunk;

                                    if (!name) {
                                        return false;
                                    }

                                    return nameGenerator.likely(name);
                                },
                                enforce: true,
                                reuseExistingChunk: true,
                                priority: -10
                            }
                        }
                    }
                }
            };

            return rspack;
        },
        manifest: ({manifest}) => {
            manifest.setContentScripts(contentScriptForManifest(contentScriptEntries));
        }
    };
});