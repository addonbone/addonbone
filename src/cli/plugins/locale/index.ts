import _ from "lodash";
import {DefinePlugin, Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@main/plugin";
import {GenerateJsonPlugin} from "@cli/bundler";
import {extractLocaleKey, modifyLocaleMessageKey} from "@locale/utils";

import Locale from "./Locale";

import {LocaleDeclaration} from "./declaration";

import {Command} from "@typing/app";
import {Browser} from "@typing/browser";
import {Language, LanguageCodes} from "@typing/locale";

export default definePlugin(() => {
    let locale: Locale;
    let declaration: LocaleDeclaration;

    return {
        name: 'adnbn:locale',
        startup: ({config}) => {
            locale = new Locale(config);
            declaration = new LocaleDeclaration(config);
        },
        locale: () => locale.files(),
        bundler: async ({config}) => {
            declaration.structure(await locale.structure()).build();

            const plugin = new GenerateJsonPlugin(await locale.json());

            if (config.command === Command.Watch) {
                plugin.watch(async () => {
                    locale.clear();

                    declaration.structure(await locale.structure()).build();

                    return await locale.json();
                });
            }

            return {
                plugins: [
                    plugin,
                    new DefinePlugin({
                        __ADNBN_LOCALE_KEYS__: JSON.stringify([...(await locale.keys())]),
                        __ADNBN_DEFINED_LOCALES__: JSON.stringify([...((await locale.builders()).keys())]),
                    })
                ]
            } satisfies RspackConfig;
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