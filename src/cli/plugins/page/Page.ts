import path from "path";
import _ from "lodash";

import type {HtmlRspackPluginOptions} from "@rspack/core";
import type {Options as HtmlRspackTagsPluginOptions} from "html-rspack-tags-plugin";

import {PageFinder} from "@cli/entrypoint";
import {ReadonlyConfig} from "@typing/config";
import {EntrypointEntries} from "@typing/entrypoint";


export default class extends PageFinder {
    public constructor(config: ReadonlyConfig) {
        super(config);

        this.names.reserve(this.getFrameworkEntry());
        this.aliases.reserve(this.getFrameworkEntry());
    }

    public getFrameworkEntry(): string {
        return 'framework.' + this.type();
    }

    public async entries(): Promise<EntrypointEntries> {
        const entries: EntrypointEntries = new Map;

        for (const [name, page] of await this.pages()) {
            entries.set(name, new Set([page.file]));
        }

        return entries;
    }

    public async html(): Promise<HtmlRspackPluginOptions[]> {
        const html: HtmlRspackPluginOptions[] = [];

        for (const [name, {file, filename, options}] of await this.pages()) {
            const {template} = options;

            html.push({
                filename,
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

        const pages = await this.pages();

        for (const {filename, options} of pages.values()) {
            const {
                name,
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