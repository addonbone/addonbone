import _ from "lodash";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";

import AbstractLocaleFinder from "./AbstractLocaleFinder";
import LocalePluginFinder from "./LocalePluginFinder";

import localeFactory from "@cli/builders/locale";

import {getAppPath, getAppSourcePath, getRootPath, getSharedPath, getSourcePath} from "@cli/resolvers/path";
import {isFileExtension} from "@cli/utils/path";

import {ReadonlyConfig} from "@typing/config";
import {EntrypointFile} from "@typing/entrypoint";
import {Language, LocaleBuilder, LocaleData, LocaleDirectoryName, LocaleKeys, LocaleStructure} from "@typing/locale";

export type LocaleBuilders = Map<Language, LocaleBuilder>;

export default class extends AbstractLocaleFinder {
    protected _plugin?: AbstractLocaleFinder;
    protected _builders?: LocaleBuilders;

    protected readonly priorityDirectories: string[];

    public constructor(config: ReadonlyConfig) {
        super(config);

        this.priorityDirectories = [
            'node_modules',
            getSourcePath(config),
            getSharedPath(config),
            getAppPath(config),
            getAppSourcePath(config),
        ];
    }

    protected async getFiles(): Promise<Set<EntrypointFile>> {
        const {mergeLocales, locale} = this.config;
        const {dir: localeDir = LocaleDirectoryName} = locale;

        const files = new Set<EntrypointFile>;

        const parser = async (directory: string): Promise<void> => {
            if (files.size === 0 || mergeLocales) {
                const localeFiles = await this.findFiles(getRootPath(directory));

                for (const file of localeFiles) {
                    files.add(file);
                }
            }
        };

        await Promise.all([
            parser(getAppSourcePath(this.config, localeDir)),
            parser(getAppPath(this.config, localeDir)),
            parser(getSharedPath(this.config, localeDir)),
            parser(getSourcePath(this.config, localeDir)),
        ]);

        return files;
    }

    protected async findFiles(directory: string): Promise<Set<EntrypointFile>> {
        const files = new Set<EntrypointFile>;

        try {
            const entries = fs.readdirSync(directory);

            for (const entry of entries) {
                const fullPath = path.join(directory, entry);
                const stats = fs.statSync(fullPath);

                if (stats.isFile() && this.isValidFilename(fullPath)) {
                    files.add(this.file(fullPath));
                }
            }
        } catch {
        }

        return files;
    }

    protected getPlugin(): AbstractLocaleFinder {
        return new LocalePluginFinder(this.config);
    }

    public plugin(): AbstractLocaleFinder {
        return this._plugin ??= this.getPlugin();
    }

    protected async getBuilders(): Promise<LocaleBuilders> {
        const priority = (file: EntrypointFile): number => {
            return _.findIndex(this.priorityDirectories, dir => file.file.includes(dir));
        }

        return _.chain(Array.from(await this.plugin().files()))
            .groupBy(file => this.getLanguageFromFilename(file.file))
            .reduce((map, files, lang) => {
                const locale = localeFactory(lang as Language, this.config);

                files.sort((a, b) => {
                    const priorityA = priority(a);
                    const priorityB = priority(b);

                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    }

                    return a.file.length - b.file.length;
                }).forEach(({file}) => {
                    const content = fs.readFileSync(file, 'utf8');

                    if (isFileExtension(file, ['yaml', 'yml'])) {
                        locale.merge(yaml.load(content) as LocaleData);
                    } else if (isFileExtension(file, 'json')) {
                        locale.merge(JSON.parse(content));
                    }
                });

                map.set(locale.lang(), locale);

                return map;
            }, new Map as LocaleBuilders).value();
    }

    public async builders(): Promise<LocaleBuilders> {
        return this._builders ??= await this.getBuilders();
    }

    public async keys(): Promise<LocaleKeys> {
        const builders = await this.builders();

        const keys = builders.values().reduce((keys, builder) => {
            return keys.concat(...builder.keys());
        }, [] as string[]);

        return new Set(keys);
    }

    public async structure(): Promise<LocaleStructure> {
        const builders = await this.builders();

        return builders.values().reduce((structure, builder) => {
            return _.merge(structure, builder.structure());
        }, {} as LocaleStructure);
    }

    async empty(): Promise<boolean> {
        return this.plugin().empty();
    }

    public clear(): this {
        this.plugin().clear();

        this._builders = undefined;

        return super.clear();
    }
}