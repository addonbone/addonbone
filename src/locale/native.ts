import NativeLocale, {LocaleNativeStructure} from "./providers/NativeLocale";

import {convertLocaleMessageKey, extractLocaleKey} from "./utils";

import {LocaleNonPluralKeysOf, SubstitutionsFor} from "@typing/locale";

const locale = new NativeLocale();

export const _ = <K extends LocaleNonPluralKeysOf<LocaleNativeStructure>>(
    key: K,
    substitutions?: SubstitutionsFor<LocaleNativeStructure, K>
): string => {
    return locale.trans(key, substitutions);
}

export const _c = <K extends LocaleNonPluralKeysOf<LocaleNativeStructure>>(
    key: K,
    count: number,
    substitutions?: SubstitutionsFor<LocaleNativeStructure, K>
): string => {
    return locale.choice(key, count, substitutions);
};

export const __ = (key: keyof LocaleNativeStructure): string => {
    if (!locale.keys().has(key)) {
        console.warn(`Locale key "${key as string}" not found in "${locale.lang()}" language.`);
    }

    return convertLocaleMessageKey(key);
};

export const __t = (key: string): string => {
    const localeKey = extractLocaleKey(key);

    if (localeKey) {
        return _(localeKey as LocaleNonPluralKeysOf<LocaleNativeStructure>);
    }

    return key;
};