import {isBrowser} from "@browser/env";
import {getI18nMessage, getI18nUILanguage} from "@browser/i18n";

import LocaleAbstract from "./LocaleAbstract";

import {convertLocaleKey} from "@locale/utils";

import {Language, LanguageCodes, LocaleCustomKeyForLanguage, LocaleKeys, LocaleStructure} from "@typing/locale";

import {Browser} from "@typing/browser";

export type LocaleNativeStructure = LocaleStructure;

export default class LocaleNative<S extends LocaleStructure = LocaleNativeStructure> extends LocaleAbstract<S> {
    public lang(): Language {
        let lang: Language | undefined;

        /**
         * The Opera browser does not support RTL languages,
         * and for Opera you need to directly indicate what kind of language it is.
         * interface language is always different
         */
        if (isBrowser(Browser.Opera)) {
            lang = getI18nMessage(LocaleCustomKeyForLanguage) as Language;

            if (LanguageCodes.has(lang)) {
                return lang;
            }
        }

        lang = getI18nUILanguage() as Language;

        if (!lang) {
            throw new Error("Locale Native: Unable to get UI language");
        }

        return lang;
    }

    public keys(): LocaleKeys {
        try {
            // @ts-expect-error
            return new Set<string>(LOCALE_KEYS);
        } catch (e) {
            console.error("Locale Native: Unable to get keys", e);

            return new Set<string>();
        }
    }

    protected value(key: keyof S): string | undefined {
        return getI18nMessage(convertLocaleKey(key as string));
    }
}