import fs from "fs";
import path from "path";
import _ from "lodash";
import {DefinePlugin} from "@rspack/core";

import {definePlugin} from "@core/define";
import {GenerateJsonPlugin} from "@cli/bundler";
import {extractLocaleKey, modifyLocaleMessageKey} from "@locale/utils";

import {getInputPath, getRootPath} from "@cli/resolvers/path";

import Locale from "./Locale";

import {Command, PackageName, SystemDir} from "@typing/app";
import {Browser} from "@typing/browser";
import {ReadonlyConfig} from "@typing/config";
import {Language, LanguageCodes, LocaleStructure} from "@typing/locale";

// TODO: Move to typescript plugin
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
    let locale: Locale;

    return {
        name: 'adnbn:locale',
        startup: ({config}) => {
            locale = new Locale(config);
        },
        locale: () => locale.files(),
        bundler: async ({config}) => {
            const plugin = new GenerateJsonPlugin(await locale.json());

            if (config.command === Command.Watch) {
                plugin.watch(() => locale.clear().json());
            }

            return {
                plugins: [
                    plugin,
                    new DefinePlugin({
                        'LOCALE_KEYS': JSON.stringify([...(await locale.keys())]),
                    })
                ]
            };
        },
        manifest: async ({config, manifest}) => {
            const {locale: localeFromConfig, browser} = config;
            const {lang, name, shortName, description} = localeFromConfig;

            let language: Language = Language.English;

            if (lang) {
                if (LanguageCodes.has(lang)) {
                    language = lang as Language;
                } else {
                    throw new Error(`Invalid lang "${lang}" provided by config`);
                }
            }

            const builders = await locale.builders();
            const keys = await locale.keys();

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