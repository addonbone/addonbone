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

export const LocaleNestedKeysSeparator = '.';

export const LocaleKeysSeparator = '_';

export const LocaleValuesSeparator = '|';

export const LanguageCodes: ReadonlySet<string> = new Set(Object.values(Language));

export const LocaleFileExtensions: ReadonlySet<string> = new Set(['yaml', 'yml', 'json']);

export const LocaleDirectoryName = 'locales';

export type LocaleValue = string | number | string[] | number[];

export type LocaleValueParams = {
    [key: string]: string | number,
};


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

    isValid(): boolean;

    validate(): this;
}

export interface LocaleValidator {
    isValid(locale: LocaleBuilder): boolean;

    validate(locale: LocaleBuilder): this;
}

export interface LocaleProvider {
    lang(): Language;

    get(key: string, params?: LocaleValueParams): string;

    choice(key: string, count: number, params?: LocaleValueParams): string;
}