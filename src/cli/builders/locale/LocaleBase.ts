import {Language, LocaleBuilder, LocaleFileData, LocaleFlatData, LocaleRawData} from "@typing/locale";

export default class implements LocaleBuilder {
    protected data: LocaleRawData[] = [];

    constructor(protected readonly language: Language) {
    }

    public filename(): string {
        return `_locales/${this.language}/messages.json`;
    }

    public get(): LocaleFlatData {
        const result: LocaleFlatData = {};

        for (const data of this.data) {
            Object.assign(result, this.convert(data));
        }

        return result;
    }

    public keys(separator?: string): string[] {
        const result: LocaleFlatData = {};

        for (const data of this.data) {
            Object.assign(result, this.convert(data, '', separator));
        }

        return Object.keys(result);
    }

    public build(): LocaleFileData {
        return Object.entries(this.get())
            .reduce((locale, [key, value]) => ({...locale, [key]: {message: value}}), {});
    }

    public merge(data: LocaleRawData): this {
        this.data.push(data);

        return this;
    }

    public lang(): Language {
        return this.language;
    }

    protected convert(data: LocaleRawData, prefix?: string, separator?: string): LocaleFlatData {
        const result: LocaleFlatData = {};

        if (!separator) {
            separator = '_';
        }

        for (const [key, value] of Object.entries(data)) {
            const resolvedKey = prefix ? [prefix, key].join(separator) : key;

            if (typeof value === 'string' || typeof value === 'number') {
                result[resolvedKey] = value.toString();
            } else if (typeof value === 'object' && value !== null) {
                Object.assign(result, this.convert(value, resolvedKey, separator));
            }
        }

        return result;
    }
}