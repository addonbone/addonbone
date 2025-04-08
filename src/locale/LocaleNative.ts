import {getI18nMessage, getI18nUILanguage} from "@browser/i18n";

import LocaleAbstract from "./LocaleAbstract";

import {convertLocaleKey} from "@locale/utils";

import {Language, LocaleStructure} from "@typing/locale";

export type LocaleNativeStructure = LocaleStructure;

export default class LocaleNative<S extends LocaleStructure = LocaleNativeStructure> extends LocaleAbstract<S> {
    public lang(): Language {
        const lang = getI18nUILanguage();

        if (!lang) {
            throw new Error("Locale Native: Unable to get UI language");
        }

        return lang as Language;
    }

    protected value(key: keyof S): string | undefined {
        return getI18nMessage(convertLocaleKey(key as string));
    }
}