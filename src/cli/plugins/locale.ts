import fs from "fs";
import path from "path";
import _ from "lodash";
import yaml from "js-yaml";

import {definePlugin} from "@core/define";

import {convertLocaleMessageKey, getLocaleFilename} from "@locale/utils";

import localeFactory from "@cli/builders/locale";
import GenerateJsonPlugin, {GenerateJsonPluginData} from "@cli/bundler/plugins/GenerateJsonPlugin";

import {processPluginHandler} from "@cli/resolvers/plugin";
import {
    getAppPath,
    getAppSourcePath,
    getInputPath,
    getRootPath,
    getSharedPath,
    getSourcePath
} from "@cli/resolvers/path";

import {getLanguageFromFilename, isValidLocaleFilename} from "@cli/utils/locale";
import {isFileExtension} from "@cli/utils/path";

import {Command, PackageName, SystemDir} from "@typing/app";
import {Browser} from "@typing/browser";
import {ReadonlyConfig} from "@typing/config";
import {
    Language,
    LanguageCodes,
    LocaleBuilder as LocaleBuilderContract,
    LocaleData,
    LocaleDirectoryName,
    LocaleStructure
} from "@typing/locale";
import {DefinePlugin} from "@rspack/core";

type LocaleBuilderMap = Map<Language, LocaleBuilderContract>;

const findLocaleFiles = (directory: string): Set<string> => {
    const files = new Set<string>;

    try {
        const entries = fs.readdirSync(directory);

        for (const entry of entries) {
            const fullPath = path.join(directory, entry);
            const stats = fs.statSync(fullPath);

            if (stats.isFile() && isValidLocaleFilename(fullPath)) {
                files.add(fullPath);
            }
        }
    } catch {
    }

    return new Set(files);
}

const getLocaleFiles = (config: ReadonlyConfig): Set<string> => {
    const files = new Set<string>;

    const parser = (directory: string): void => {
        if (files.size === 0 || config.mergeLocales) {
            const localeFiles = findLocaleFiles(getRootPath(directory));

            for (const file of localeFiles) {
                files.add(file);
            }
        }
    };

    parser(getAppSourcePath(config, config.localeDir));
    parser(getAppPath(config, config.localeDir));
    parser(getSharedPath(config, config.localeDir));
    parser(getSourcePath(config, config.localeDir));

    return files;
}


const getVendorLocaleFiles = (config: ReadonlyConfig, name: string, directory: string): Set<string> => {
    const files: Array<string | undefined> = [];

    const resolve = (file: string): string | undefined => {
        try {
            return require.resolve(path.posix.join(name, directory, file), {paths: [process.cwd()]});
        } catch {
        }
    }

    for (const code of LanguageCodes) {
        files.push(
            resolve(code),
            resolve(`${code}.${config.browser}`),
        );
    }

    return new Set(files.filter(Boolean) as string[]);
}

const getPluginLocaleFiles = async (config: ReadonlyConfig): Promise<Set<string>> => {
    const pluginResult = await Array.fromAsync(processPluginHandler(config, 'locale', {
        config,
    }));

    const files = pluginResult.reduce((files, {name, result}) => {
        if (_.isBoolean(result)) {
            result = LocaleDirectoryName;
        }

        if (_.isString(result)) {
            result = getVendorLocaleFiles(config, name, result);
        }

        if (_.isArray(result) || _.isSet(result)) {
            for (const file of result) {
                if (_.isString(file) && !_.isEmpty(result)) {
                    files.push(file);
                }
            }
        }

        return files;
    }, [] as string[]).filter(file => {
        const {name} = path.parse(file);

        if (name.includes('.')) {
            return name.includes(`.${config.browser}`);
        }

        return true;
    });

    return new Set(files);
}

const getLocaleBuilders = async (config: ReadonlyConfig): Promise<LocaleBuilderMap> => {
    const localeDirs = [
        'node_modules',
        getSharedPath(config),
        getAppPath(config),
        getAppSourcePath(config),
    ];

    const getLocaleDirPriority = (path: string): number => {
        return _.findIndex(localeDirs, dir => path.includes(dir));
    }

    const localeFiles = await getPluginLocaleFiles(config);

    return _.chain(Array.from(localeFiles))
        .groupBy(file => getLanguageFromFilename(file))
        .reduce((map, files, lang) => {
            const locale = localeFactory(lang as Language, config);

            files.sort((a, b) => {
                const priorityA = getLocaleDirPriority(a);
                const priorityB = getLocaleDirPriority(b);

                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }

                return a.length - b.length;
            }).forEach(file => {
                const content = fs.readFileSync(file, 'utf8');

                if (isFileExtension(file, ['yaml', 'yml'])) {
                    locale.merge(yaml.load(content) as LocaleData);
                } else if (isFileExtension(file, 'json')) {
                    locale.merge(JSON.parse(content));
                }
            });

            map.set(locale.lang(), locale);

            return map;
        }, new Map as LocaleBuilderMap).value();
}

const generateLocaleDeclaration = (config: ReadonlyConfig, structure: LocaleStructure): void => {
    const template = `import type {LocaleNativeStructure} from '${PackageName}/locale';
    
declare module '${PackageName}/locale' {
type LocaleNativeStructure = ${JSON.stringify(structure, null, 2)};
}`;

    const systemDirPath = getRootPath(getInputPath(config, SystemDir));

    fs.mkdirSync(systemDirPath, {recursive: true});

    fs.writeFileSync(path.join(systemDirPath, 'locale.d.ts'), template);
}

export default definePlugin(() => {
    let builders: LocaleBuilderMap = new Map;

    const processing = async (config: ReadonlyConfig): Promise<GenerateJsonPluginData> => {
        builders = await getLocaleBuilders(config);

        const data: GenerateJsonPluginData = {};

        let structure: LocaleStructure = {};

        for (const locale of builders.values()) {
            structure = _.merge(structure, locale.structure());
            data[getLocaleFilename(locale.lang())] = locale.build();
        }

        generateLocaleDeclaration(config, structure);

        return data;
    }

    return {
        name: 'adnbn:locale',
        locale: ({config}) => getLocaleFiles(config),
        bundler: async ({config}) => {
            const data = await processing(config);

            const plugin = new GenerateJsonPlugin(data);

            if (config.command === Command.Watch) {
                plugin.watch(async () => {
                    return await processing(config);
                });
            }

            const keys = builders.values().reduce((keys, builder) => {
                return new Set([...keys, ...builder.keys()]);
            }, new Set<string>());

            return {
                plugins: [
                    plugin,
                    new DefinePlugin({
                        'LOCALE_KEYS': JSON.stringify([...keys]),
                    })
                ]
            };
        },
        manifest: ({config, manifest}) => {
            const {locale, browser} = config;
            const {lang, nameKey, shortNameKey, descriptionKey} = locale;

            let language: Language = Language.English;

            if (lang) {
                if (LanguageCodes.has(lang)) {
                    language = lang as Language;
                } else {
                    throw new Error(`Invalid lang "${lang}" provided by config`);
                }
            }

            manifest.setLocale(builders.size > 0 ? language : undefined);

            if (builders.size > 0) {
                if (shortNameKey) {
                    let shortName: string | undefined = convertLocaleMessageKey(shortNameKey);

                    /** Opera/Edge do not support localization in manifest's short_name field */
                    if (browser === Browser.Opera || browser === Browser.Edge) {
                        const instance = builders.get(language);

                        if (!instance) {
                            throw new Error(`Locale not found for ${lang}`);
                        }

                        shortName = instance.get().get(shortNameKey);
                    }

                    manifest.setShortName(shortName);
                }

                if (descriptionKey) {
                    manifest.setDescription(convertLocaleMessageKey(descriptionKey));
                }

                if (nameKey) {
                    manifest.setName(convertLocaleMessageKey(nameKey));

                    return;
                }
            }

            manifest.setName(_.startCase(config.app));
        }
    };
});