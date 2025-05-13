import _ from "lodash";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";

import AbstractLocaleFinder from "./AbstractLocaleFinder";
import AssetPluginFinder from "./AssetPluginFinder";
import AssetPriorityFinder from "./AssetPriorityFinder";

import localeFactory from "@cli/builders/locale";
import {isFileExtension} from "@cli/utils/path";

import {ReadonlyConfig} from "@typing/config";
import {EntrypointFile} from "@typing/entrypoint";
import {Language, LanguageCodes, LocaleBuilder, LocaleData, LocaleKeys, LocaleStructure} from "@typing/locale";


export type LocaleBuilders = Map<Language, LocaleBuilder>;

export default class extends AbstractLocaleFinder {
    protected _plugin?: AssetPluginFinder;
    protected _builders?: LocaleBuilders;

    protected readonly priority: AssetPriorityFinder;

    public constructor(config: ReadonlyConfig) {
        super(config);

        this.priority = new AssetPriorityFinder(config, this);
    }

    protected getFiles(): Promise<Set<EntrypointFile>> {
        return this.priority.files();
    }

    protected getPlugin(): AssetPluginFinder {
        return new AssetPluginFinder(this.config, 'locale', this);
    }

    public plugin(): AssetPluginFinder {
        return this._plugin ??= this.getPlugin();
    }

    protected async getBuilders(): Promise<LocaleBuilders> {

        return _.chain(Array.from(await this.plugin().files()))
            .groupBy(file => this.getLanguageFromFilename(file.file))
            .reduce((map, files, lang) => {
                const locale = localeFactory(lang as Language, this.config);

                files.sort((a, b) => {
                    const priorityA = this.priority.priority(a);
                    const priorityB = this.priority.priority(b);

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

    protected getLanguageFromFilename(filename: string): Language {
        let {name} = path.parse(filename);

        if (name.includes('.')) {
            name = name.split('.').slice(0, -1).join('.');
        }

        if (LanguageCodes.has(name)) {
            return name as Language;
        }

        throw new Error(`Invalid locale filename: ${filename}`);
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
        this.priority.clear();

        this._builders = undefined;

        return super.clear();
    }
}