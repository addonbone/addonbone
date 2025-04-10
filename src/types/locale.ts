export enum Language {
    Arabic = 'ar',
    Amharic = 'am',
    Bulgarian = 'bg',
    Bengali = 'bn',
    Catalan = 'ca',
    Czech = 'cs',
    Danish = 'da',
    German = 'de',
    Greek = 'el',
    English = 'en',
    EnglishAustralia = 'en_AU',
    EnglishGreatBritain = 'en_GB',
    EnglishUSA = 'en_US',
    Spanish = 'es',
    SpanishLatinAmericaAndCaribbean = 'es_419',
    Estonian = 'et',
    Persian = 'fa',
    Finnish = 'fi',
    Filipino = 'fil',
    French = 'fr',
    Gujarati = 'gu',
    Hebrew = 'he',
    Hindi = 'hi',
    Croatian = 'hr',
    Hungarian = 'hu',
    Indonesian = 'id',
    Italian = 'it',
    Japanese = 'ja',
    Kannada = 'kn',
    Korean = 'ko',
    Lithuanian = 'lt',
    Latvian = 'lv',
    Malayalam = 'ml',
    Marathi = 'mr',
    Malay = 'ms',
    Dutch = 'nl',
    Norwegian = 'no',
    Polish = 'pl',
    PortugueseBrazil = 'pt_BR',
    PortuguesePortugal = 'pt_PT',
    Romanian = 'ro',
    Russian = 'ru',
    Slovak = 'sk',
    Slovenian = 'sl',
    Serbian = 'sr',
    Swedish = 'sv',
    Swahili = 'sw',
    Tamil = 'ta',
    Telugu = 'te',
    Thai = 'th',
    Turkish = 'tr',
    Ukrainian = 'uk',
    Vietnamese = 'vi',
    ChineseChina = 'zh_CN',
    ChineseTaiwan = 'zh_TW',
}

export enum LocaleDir {
    RightToLeft = 'rtl',
    LeftToRight = 'ltr',
}

export const RtlLanguages: ReadonlySet<Language> = new Set([
    Language.Arabic,
    Language.Persian,
    Language.Hebrew,
]);

export const LocaleNestedKeysSeparator = '.';

export const LocaleKeysSeparator = '_';

export const LocaleValuesSeparator = '|';

export const LocaleCustomKeyForLanguage = 'locale';

export const LocaleKeyMarker = '#';

export const LanguageCodes: ReadonlySet<string> = new Set(Object.values(Language));

export const LocaleFileExtensions: ReadonlySet<string> = new Set(['yaml', 'yml', 'json']);

export const LocaleDirectoryName = 'locales';

export type LocaleValue = string | number | string[] | number[];

export type LocaleData = {
    [key: string]: LocaleValue | LocaleData;
};

export type LocaleItems = Map<string, string>;

export type LocaleKeys = ReadonlySet<string>;

export type LocaleMessages = {
    [key: string]: {
        message: string;
    };
};

export interface LocaleBuilder {
    lang(): Language;

    merge(data: LocaleData): this;

    build(): LocaleMessages;

    get(): LocaleItems;

    keys(): LocaleKeys;

    structure(): LocaleStructure;

    isValid(): boolean;

    validate(): this;
}

export interface LocaleValidator {
    isValid(locale: LocaleBuilder): boolean;

    validate(locale: LocaleBuilder): this;
}

export type LocaleFutures = {
    plural: boolean;
    substitutions: readonly string[];
};

export type LocaleStructure = Record<string, LocaleFutures>;

export type LocaleNonPluralKeys<T extends LocaleStructure> = {
    [K in keyof T]: T[K]['plural'] extends false ? K : never;
}[keyof T];

export type LocalePluralKeys<T extends LocaleStructure> = {
    [K in keyof T]: T[K]['plural'] extends true ? K : never;
}[keyof T];

export type SubstitutionsFor<
    T extends LocaleStructure,
    K extends keyof T
> = {
    [P in T[K]['substitutions'][number]]?: string | number;
};

export type LocaleNonPluralKeysOf<S extends LocaleStructure> = Extract<keyof S, LocaleNonPluralKeys<S>>;
export type LocalePluralKeysOf<S extends LocaleStructure> = Extract<keyof S, LocalePluralKeys<S>>;

export interface LocaleProvider<S extends LocaleStructure> {
    lang(): Language;

    keys(): LocaleKeys;

    trans<K extends LocaleNonPluralKeysOf<S>>(
        key: K,
        substitutions?: SubstitutionsFor<S, K>
    ): string;

    choice<K extends LocalePluralKeysOf<S>>(
        key: K,
        count: number,
        substitutions?: SubstitutionsFor<S, K>
    ): string;
}
