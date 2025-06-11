import path from "path";
import _ from "lodash";

import type {HtmlRspackPluginOptions} from "@rspack/core";
import type {Options as HtmlRspackTagsPluginOptions} from "html-rspack-tags-plugin";

import {AbstractViewFinder} from "@cli/entrypoint";

import {EntrypointEntries} from "@typing/entrypoint";
import {ViewEntrypointOptions} from "@typing/view";
import {ReadonlyConfig} from "@typing/config";


export default class<O extends ViewEntrypointOptions> {
    public constructor(
        protected readonly config: ReadonlyConfig,
        protected readonly finder: AbstractViewFinder<O>
    ) {

    }

    public async entries(): Promise<EntrypointEntries> {
        const entries: EntrypointEntries = new Map;

        for (const [name, page] of await this.finder.views()) {
            entries.set(name, new Set([page.file]));
        }

        return entries;
    }

    public async html(): Promise<HtmlRspackPluginOptions[]> {
        const html: HtmlRspackPluginOptions[] = [];

        for (const [name, {file, filename, options}] of await this.finder.views()) {
            const {template, title} = options;

            html.push({
                filename,
                title: title || _.startCase(this.config.app),
                template: template ? path.resolve(path.dirname(file.file), template) : undefined,
                chunks: [name],
                inject: 'body',
                minify: true,
            });
        }

        return html;
    }

    public async tags(): Promise<HtmlRspackTagsPluginOptions[]> {
        const tags: HtmlRspackTagsPluginOptions[] = [];

        const views = await this.finder.views();

        for (const {filename, options} of views.values()) {
            const {
                as,
                title,
                template,
                excludeApp,
                includeApp,
                excludeBrowser,
                includeBrowser,
                ...tagOptions
            } = options;

            if (!_.isEmpty(tagOptions)) {
                tags.push({
                    ...tagOptions,
                    files: [filename],
                });
            }
        }

        return tags;
    }
}