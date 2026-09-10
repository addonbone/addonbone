import _ from "lodash";
import {DefinePlugin, type Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@main/plugin";
import {GenerateJsonPlugin, GenerateModulePlugin} from "@cli/bundler";
import {extractLocaleKey, modifyLocaleMessageKey} from "@locale/utils";

import Locale from "./Locale";
import {LocaleDeclaration} from "./declaration";
import {createLocaleModule, LocaleModuleName} from "./module";

import {Command} from "@typing/app";
import {Browser} from "@typing/browser";

export default definePlugin(() => {
    let locale: Locale;
    let declaration: LocaleDeclaration;

    return {
        name: "adnbn:locale",
        startup: ({config}) => {
            locale = new Locale(config);
            declaration = new LocaleDeclaration(config);
        },
        locale: () => locale.files(),
        bundler: async ({config}) => {
            const prepareLocale = async () => {
                await locale.validate();
                declaration.structure(await locale.structure()).build();
            };

            const getModules = async () => ({
                [LocaleModuleName]: createLocaleModule(await locale.catalogue()),
            });

            await prepareLocale();

            const jsonPlugin = new GenerateJsonPlugin(await locale.json());
            const modulePlugin = new GenerateModulePlugin(await getModules()).layer("adnbn:locale");
            const constantsPlugin = new DefinePlugin({
                __ADNBN_LOCALE_KEYS__: JSON.stringify([...(await locale.keys())]),
                __ADNBN_DEFINED_LOCALES__: JSON.stringify([...(await locale.languages())]),
            });

            if (config.command === Command.Watch) {
                jsonPlugin.watch(async () => {
                    locale.clear();
                    await prepareLocale();

                    return locale.json();
                });

                const watchFiles = [...(await locale.plugin().files())].map(({file}) => file);
                modulePlugin.watch(getModules, watchFiles);
            }

            return {
                // JSON refresh clears and prepares the shared cache before the module reads it.
                plugins: [jsonPlugin, modulePlugin, constantsPlugin],
                optimization: config.commonChunks
                    ? {
                          splitChunks: {
                              cacheGroups: {
                                  adnbnLocaleShared: {
                                      layer: "adnbn:locale",
                                      name: "locale",
                                      minChunks: 2,
                                      minSize: 0,
                                      enforce: true,
                                      priority: 60,
                                  },
                                  adnbnLocaleLarge: {
                                      layer: "adnbn:locale",
                                      name: "locale",
                                      minChunks: 1,
                                      minSize: 100_000,
                                      enforce: true,
                                      priority: 70,
                                  },
                              },
                          },
                      }
                    : undefined,
            } satisfies RspackConfig;
        },
        manifest: async ({config, manifest}) => {
            const {lang: language, name, shortName, description, browser} = config;
            const availableLanguages = await locale.languages();
            const builders = await locale.builders();
            const hasLocales = builders.size > 0;

            if (availableLanguages.size > 0 && !availableLanguages.has(language)) {
                throw new Error(
                    `Language "${language}" not found in available translations. Available languages: ${[...availableLanguages].join(", ")}`
                );
            }

            await locale.validate();

            const keys = await locale.keys();

            const assertLocaleKey = (value: string, label: string): void => {
                const key = extractLocaleKey(value);

                if (!key) {
                    return;
                }

                if (!hasLocales) {
                    throw new Error(`Locale ${label} key "${key}" provided but no translations were found`);
                }

                if (!keys.has(key)) {
                    throw new Error(`Locale ${label} key "${key}" not found in translation`);
                }
            };

            manifest.setLocale(hasLocales ? language : undefined);

            if (shortName) {
                let manifestShortName = modifyLocaleMessageKey(shortName) ?? shortName;
                const shortNameKey = extractLocaleKey(shortName);

                assertLocaleKey(shortName, "short name");

                /** Opera/Edge do not support localization in manifest's short_name field */
                if (shortNameKey && (browser === Browser.Opera || browser === Browser.Edge)) {
                    const defaultBuilder = builders.get(language);

                    if (!defaultBuilder) {
                        throw new Error(`Locale not found for "${language}"`);
                    }

                    manifestShortName = defaultBuilder.get().get(shortNameKey) ?? manifestShortName;
                }

                manifest.setShortName(manifestShortName);
            }

            if (description) {
                assertLocaleKey(description, "description");
                manifest.setDescription(modifyLocaleMessageKey(description));
            }

            if (name) {
                assertLocaleKey(name, "name");

                const manifestName = modifyLocaleMessageKey(name);

                if (manifestName) {
                    manifest.setName(manifestName);

                    return;
                }
            }

            manifest.setName(_.startCase(config.app));
        },
    };
});
