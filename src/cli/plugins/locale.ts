import fs from "fs";
import path from "path";
import _ from "lodash";
import yaml from "js-yaml";

import {definePlugin} from "@core/define";

import {convertLocaleMessageKey, getLocaleFilename} from "@locale/utils";

import localeFactory from "@cli/builders/locale";
import GenerateJsonPlugin, {GenerateJsonPluginData} from "@cli/bundler/plugins/GenerateJsonPlugin";

import {processPluginHandler} from "@cli/resolvers/plugin";
import {getAppPath, getAppSourcePath, getRootPath, getSharedPath, getSourcePath} from "@cli/resolvers/path";

import {getLanguageFromFilename, isValidLocaleFilename} from "@cli/utils/locale";
import {isFileExtension} from "@cli/utils/path";

import {Command} from "@typing/app";
import {ReadonlyConfig} from "@typing/config";
import {
    Language,
    LanguageCodes,
    LocaleBuilder as LocaleBuilderContract,
    LocaleData,
    LocaleDirectoryName
} from "@typing/locale";


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

const getLocaleBuilders = async (config: ReadonlyConfig): Promise<LocaleBuilderContract[]> => {
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
        .map((files, lang: Language) => {
            const locale = localeFactory(lang, config);

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

            return locale;
        }).value();
}

const getLocaleJsonData = async (config: ReadonlyConfig): Promise<GenerateJsonPluginData> => {
    const locales = await getLocaleBuilders(config);

    return locales.reduce((entries, locale) => {
        return {...entries, [getLocaleFilename(locale.lang())]: locale.build()};
    }, {});
}

export default definePlugin(() => {
    let hasTranslations = false;

    return {
        name: 'adnbn:locale',
        locale: ({config}) => getLocaleFiles(config),
        bundler: async ({config}) => {
            const data = await getLocaleJsonData(config);

            hasTranslations = !_.isEmpty(data);

            const plugin = new GenerateJsonPlugin(data, 'locale');

            if (config.command === Command.Watch) {
                plugin.watch(async () => {
                    const data = await getLocaleJsonData(config);

                    hasTranslations = !_.isEmpty(data);

                    return data;
                });
            }

            return {plugins: [plugin]};
        },
        manifest: ({config, manifest}) => {
            const {locale} = config;
            const {lang = Language.English, nameKey, shortNameKey, descriptionKey} = locale;

            manifest.setLocale(hasTranslations ? lang : undefined);

            if (hasTranslations) {
                if (nameKey) {
                    manifest.setName(convertLocaleMessageKey(nameKey));

                    if (shortNameKey) {
                        manifest.setShortName(convertLocaleMessageKey(shortNameKey));
                    }

                    if (descriptionKey) {
                        manifest.setDescription(convertLocaleMessageKey(descriptionKey));
                    }

                    return;
                }
            }

            manifest.setName(_.startCase(config.app));
        }
    };
});