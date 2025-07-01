import _ from "lodash";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";

import AbstractAssetFinder from "./AbstractAssetFinder";
import AssetPluginFinder from "./AssetPluginFinder";

import localeFactory from "@cli/builders/locale";
import {isFileExtension} from "@cli/utils/path";

import {ReadonlyConfig} from "@typing/config";
import {
    Language,
    LanguageCodes,
    LocaleBuilder,
    LocaleData,
    LocaleFileExtensions,
    LocaleKeys,
    LocaleStructure,
} from "@typing/locale";

export type LocaleBuilders = Map<Language, LocaleBuilder>;

export default class extends AbstractAssetFinder {
    protected _plugin?: AssetPluginFinder;
    protected _builders?: LocaleBuilders;

    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public isValidName(name: string): boolean {
        if (name.includes(".")) {
            name = name.split(".").slice(0, -1).join(".");
        }

        return super.isValidName(name);
    }

    public isValidExtension(extension: string): boolean {
        return LocaleFileExtensions.has(extension);
    }

    public getDirectory(): string {
        return this.config.locale.dir || "locales";
    }

    public getNames(): ReadonlySet<string> {
        return LanguageCodes;
    }

    public canMerge(): boolean {
        return this.config.mergeLocales;
    }

    protected getPlugin(): AssetPluginFinder {
        return new AssetPluginFinder(this.config, "locale", this);
    }

    public plugin(): AssetPluginFinder {
        return (this._plugin ??= this.getPlugin());
    }

    protected async getBuilders(): Promise<LocaleBuilders> {
        return _.chain(Array.from(await this.plugin().files()))
            .groupBy(file => this.getLanguageFromFilename(file.file))
            .reduce((map, files, lang) => {
                const locale = localeFactory(lang as Language, this.config);

                for (const {file} of files) {
                    const content = fs.readFileSync(file, "utf8");

                    if (isFileExtension(file, ["yaml", "yml"])) {
                        locale.merge(yaml.load(content) as LocaleData);
                    } else if (isFileExtension(file, "json")) {
                        locale.merge(JSON.parse(content));
                    }
                }

                map.set(locale.lang(), locale);

                return map;
            }, new Map() as LocaleBuilders)
            .value();
    }

    protected getLanguageFromFilename(filename: string): Language {
        let {name} = path.parse(filename);

        if (name.includes(".")) {
            name = name.split(".").slice(0, -1).join(".");
        }

        if (LanguageCodes.has(name)) {
            return name as Language;
        }

        throw new Error(`Invalid locale filename: ${filename}`);
    }

    public async builders(): Promise<LocaleBuilders> {
        return (this._builders ??= await this.getBuilders());
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

    public async languages(): Promise<Set<Language>> {
        const builders = await this.builders();

        return new Set(builders.keys());
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
