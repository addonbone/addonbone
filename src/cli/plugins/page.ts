import _ from 'lodash';
import path from "path";
import {DefinePlugin, HtmlRspackPlugin, Plugin} from "@rspack/core";
import HtmlRspackTagsPlugin from "html-rspack-tags-plugin";

import {definePlugin} from "@core/define";
import {getPageOptions, InlineNameGenerator, isValidEntrypointOptions, NameGenerator} from "@cli/entrypoint";

import EntrypointPlugin, {EntrypointPluginEntries} from "@cli/bundler/plugins/EntrypointPlugin";

import {virtualViewModule} from "@cli/virtual";
import {getEntrypointFiles} from "@cli/resolvers/entrypoint";
import {getPluginEntrypointFiles} from "@cli/resolvers/plugin";

import {EntrypointFile, EntrypointType} from "@typing/entrypoint";
import {PageEntrypointOptions} from "@typing/page";
import {ReadonlyConfig} from "@typing/config";
import {Command} from "@typing/app";

interface PageEntry {
    filename: string;
    alias: string;
    file: EntrypointFile;
    options: PageEntrypointOptions;
}

type PageEntries = Map<string, PageEntry>;

const pageEntryNameSuffix = EntrypointType.Page;
const frameworkPageEntryName = 'framework.' + pageEntryNameSuffix;

const entryGenerator = new NameGenerator(EntrypointType.Page)
    .reserve(frameworkPageEntryName);

const nameGenerator = new InlineNameGenerator(EntrypointType.Page)
    .reserve(frameworkPageEntryName)
    .reserve(EntrypointType.Background)
    .reserve(EntrypointType.Command)
    .reserve(EntrypointType.ContentScript)
    .reserve(EntrypointType.Sidebar)
    .reserve(EntrypointType.Popup)
    .reserve(EntrypointType.Offscreen)
    .reserve(EntrypointType.Options);

const getPageEntries = async (config: ReadonlyConfig): Promise<PageEntries> => {
    const files = await getPluginEntrypointFiles(config, 'page');

    const entries = files.values().reduce((entries, file) => {
        const options = getPageOptions(file);

        if (!isValidEntrypointOptions(options, config)) {
            return entries;
        }

        let {name} = options;

        let alias = name ? nameGenerator.name(name) : nameGenerator.file(file);

        const filename = path.join(config.htmlDir, alias + '.html');

        name = name ? entryGenerator.name(name) : entryGenerator.file(file);

        if (file.external) {
            alias = file.import;
        }

        entries.set(name, {alias, filename, file, options});

        return entries;
    }, new Map as PageEntries);

    entryGenerator.reset();
    nameGenerator.reset();

    return entries;
}


const extractEntries = (entries: PageEntries): EntrypointPluginEntries => {
    return Array.from(entries).reduce((collect, [name, {file}]) => {
        return {
            ...collect,
            [name]: [file],
        }
    }, {} as EntrypointPluginEntries);
}

const extractAlias = (entries: PageEntries): Record<string, string> => {
    return entries.values().reduce((collect, {alias, filename}) => {
        return {
            ...collect,
            [alias]: filename,
        };
    }, {} as Record<string, string>);
}

const createHtmlPlugins = (entries: PageEntries): Plugin[] => {
    const plugins: Plugin[] = [];

    for (const [name, {file, filename, options}] of entries.entries()) {
        const {
            name: _name,
            title,
            template,
            excludeApp,
            includeApp,
            excludeBrowser,
            includeBrowser,
            ...tagOptions
        } = options;

        plugins.push(new HtmlRspackPlugin({
            filename,
            template: template ? path.resolve(path.dirname(file.file), template) : undefined,
            chunks: [name],
            inject: 'body',
            minify: true,
            meta: {
                'color-scheme': 'dark light',
                "viewport": "width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0",
            }
        }));

        if (!_.isEmpty(tagOptions)) {
            plugins.push(new HtmlRspackTagsPlugin({
                ...tagOptions,
                files: [filename],
            }));
        }
    }

    return plugins;
}

export default definePlugin(() => {
    return {
        name: 'adnbn:page',
        page: ({config}) => getEntrypointFiles(config, EntrypointType.Page),
        bundler: async ({config}) => {
            const pageEntries = await getPageEntries(config);

            if (_.isEmpty(pageEntries)) {
                if (config.debug) {
                    console.info('Page entries not found');
                }

                return {};
            }

            const pageEntrypointPlugin = (new EntrypointPlugin(extractEntries(pageEntries)))
                .virtual(file => virtualViewModule(file));

            if (config.command === Command.Watch) {
                pageEntrypointPlugin.watch(async () => {
                    const pageEntries = await getPageEntries(config);

                    return extractEntries(pageEntries);
                });
            }

            const htmlPlugins = createHtmlPlugins(pageEntries);

            return {
                plugins: [
                    new DefinePlugin({
                        'PAGE_ALIAS': JSON.stringify(extractAlias(pageEntries)),
                    }),
                    pageEntrypointPlugin,
                    ...htmlPlugins
                ]
            };
        }
    };
});