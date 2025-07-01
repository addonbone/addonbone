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

export const LocaleKeyMarker = '@';

export const LanguageCodes: ReadonlySet<string> = new Set(Object.values(Language));

export const LocaleFileExtensions: ReadonlySet<string> = new Set(['yaml', 'yml', 'json']);

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

export interface LocaleFutures {
    plural: boolean;
    substitutions: readonly string[];
}

export interface LocaleStructure {
    [key: string]: LocaleFutures;
}

export type LocaleNonPluralKeys<T extends LocaleStructure> =
    { [K in keyof T]: T[K] extends { plural: false } ? K : never }[keyof T] & string

export type LocalePluralKeys<T extends LocaleStructure> =
    { [K in keyof T]: T[K] extends { plural: true } ? K : never }[keyof T] & string

export type LocaleSubstitutionsFor<
    T extends LocaleStructure,
    K extends keyof T
> = T[K] extends { substitutions: readonly (infer U)[] }
    ? Partial<Record<U & string, string | number>>
    : never

export interface LocaleProvider<S extends LocaleStructure> {
    lang(): Language;

    languages(): Set<Language>;

    keys(): ReadonlySet<keyof S>;

    // non-plural keys
    trans<K extends LocaleNonPluralKeys<S>>(
        key: K,
        substitutions?: LocaleSubstitutionsFor<S, K>
    ): string;

    // plural keys
    choice<K extends LocalePluralKeys<S>>(
        key: K,
        count: number,
        substitutions?: LocaleSubstitutionsFor<S, K>
    ): string;
}

export interface LocaleDynamicProvider<S extends LocaleStructure> extends LocaleProvider<S> {
    change(lang: Language): Promise<Language>;
}
