import {Language, LocaleKeysSeparator, LocaleNestedKeysSeparator} from "@typing/locale";

export const getLocaleFilename = (lang: Language): string => {
    return `_locales/${lang}/messages.json`;
};

export const convertLocaleKey = (key: string): string => {
    return key.replaceAll(LocaleNestedKeysSeparator, LocaleKeysSeparator);
}

export const convertLocaleMessageKey = (key: string): string => {
    return `__MSG_${convertLocaleKey(key)}__`;
}