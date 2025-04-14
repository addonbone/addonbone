import _ from 'lodash';
import path from "path";
import {rspack} from "@rspack/core"

import {definePlugin} from "@core/define";
import {getPageOptions, isValidEntrypointOptions, NameGenerator} from "@cli/entrypoint";

import EntrypointPlugin, {EntrypointPluginEntries} from "@cli/bundler/plugins/EntrypointPlugin";

import {virtualViewModule} from "@cli/virtual";
import {getEntrypointFiles} from "@cli/resolvers/entrypoint";
import {getPluginEntrypointFiles} from "@cli/resolvers/plugin";

import {EntrypointFile, EntrypointType} from "@typing/entrypoint";
import {PageEntrypointOptions} from "@typing/page";
import {ReadonlyConfig} from "@typing/config";
import {Command} from "@typing/app";


interface PageEntry {
    file: EntrypointFile;
    options: PageEntrypointOptions;
}

type PageEntries = Record<string, PageEntry>;

const pageEntryNameSuffix = EntrypointType.Page;
const frameworkPageEntryName = 'framework.' + pageEntryNameSuffix;

const nameGenerator = new NameGenerator(EntrypointType.Page).reserve(frameworkPageEntryName);

const getPageEntries = async (config: ReadonlyConfig): Promise<PageEntries> => {
    const files = await getPluginEntrypointFiles(config, 'page');

    const entries = files.values().reduce((entries, file) => {
        const options = getPageOptions(file);

        if (!isValidEntrypointOptions(options, config)) {
            return entries;
        }

        let {name} = options;

        name = name ? nameGenerator.name(name) : nameGenerator.file(file);

        return {
            ...entries,
            [name]: {file, options}
        };
    }, {} as PageEntries);

    nameGenerator.reset();

    return entries;
}

const pageEntryForPlugin = (entries: PageEntries): EntrypointPluginEntries => {
    return _.mapValues(entries, ({file}) => [file]);
}

export default definePlugin(() => {
    return {
        name: 'adnbn:page',
        page: ({config}) => getEntrypointFiles(config, EntrypointType.Page),
        bundler: async ({config}) => {
            const pageEntries = await getPageEntries(config);

            if (_.isEmpty(pageEntries)) {
                if (config.debug) {
                    console.warn('Page entries not found');
                }

                return {};
            }

            const pageEntrypointPlugin = (new EntrypointPlugin(pageEntryForPlugin(pageEntries)))
                .virtual(file => virtualViewModule(file));

            const htmlPlugin = new rspack.HtmlRspackPlugin({
                filename: path.join('html', 'page.html'),
                chunks: _.keys(pageEntries),
            });

            if (config.command === Command.Watch) {
                pageEntrypointPlugin.watch(async () => {
                    const pageEntries = await getPageEntries(config);

                    return pageEntryForPlugin(pageEntries);
                });
            }

            return {
                plugins: [pageEntrypointPlugin, htmlPlugin]
            };
        }
    };
});