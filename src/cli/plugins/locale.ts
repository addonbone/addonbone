import fs from "fs";
import path from "path";
import _ from "lodash";
import yaml from "js-yaml";
import {DefinePlugin} from "@rspack/core";

import {definePlugin} from "@core/define";

import {extractLocaleKey, getLocaleFilename, modifyLocaleMessageKey} from "@locale/utils";

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
    LocaleFileExtensions,
    LocaleStructure
} from "@typing/locale";

type LocaleBuilderMap = Map<Language, LocaleBuilderContract>;

export const isValidLocaleFilename = (filename: string): boolean => {
    let {name, ext} = path.parse(filename);

    if (ext.startsWith('.')) {
        ext = ext.slice(1);
    }

    if (name.includes('.')) {
        name = name.split('.').slice(0, -1).join('.');
    }

    return LocaleFileExtensions.has(ext) && LanguageCodes.has(name);
}

export const getLanguageFromFilename = (filename: string): Language => {
    let {name} = path.parse(filename);

    if (name.includes('.')) {
        name = name.split('.').slice(0, -1).join('.');
    }

    if (LanguageCodes.has(name)) {
        return name as Language;
    }

    throw new Error(`Invalid locale filename: ${filename}`);
}

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
    let keys = new Set<string>;

    const processing = async (config: ReadonlyConfig): Promise<GenerateJsonPluginData> => {
        builders = await getLocaleBuilders(config);

        const data: GenerateJsonPluginData = {};

        let structure: LocaleStructure = {};

        keys.clear();

        for (const locale of builders.values()) {
            structure = _.merge(structure, locale.structure());
            data[getLocaleFilename(locale.lang())] = locale.build();

            keys = new Set([...keys, ...locale.keys()]);
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
            const {lang, name, shortName, description} = locale;

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
                if (shortName) {
                    let manifestShortName: string | undefined = modifyLocaleMessageKey(shortName);

                    const shortNameKey = extractLocaleKey(shortName);

                    if (shortNameKey) {
                        if (!keys.has(shortNameKey)) {
                            throw new Error(`Locale short name key "${shortNameKey}" not found in translation`);
                        }

                        /** Opera/Edge do not support localization in manifest's short_name field */
                        if (browser === Browser.Opera || browser === Browser.Edge) {
                            const instance = builders.get(language);

                            if (!instance) {
                                throw new Error(`Locale not found for "${language}"`);
                            }

                            manifestShortName = instance.get().get(shortNameKey);
                        }
                    }

                    manifest.setShortName(manifestShortName);
                }

                if (description) {
                    const descriptionKey = extractLocaleKey(description);

                    if (descriptionKey && !keys.has(descriptionKey)) {
                        throw new Error(`Locale description key "${descriptionKey}" not found in translation`);
                    }

                    manifest.setDescription(modifyLocaleMessageKey(description));
                }

                if (name) {
                    const nameKey = extractLocaleKey(name);

                    if (nameKey && !keys.has(nameKey)) {
                        throw new Error(`Locale name key "${nameKey}" not found in translation`);
                    }

                    const manifestName = modifyLocaleMessageKey(name);

                    if (manifestName) {
                        manifest.setName(manifestName);

                        return;
                    }
                }
            }

            manifest.setName(_.startCase(config.app));
        }
    };
});