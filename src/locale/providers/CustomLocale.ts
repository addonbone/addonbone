import {convertLocaleKey} from "../utils";

import AbstractLocale from "./AbstractLocale";
import {LocaleNativeStructure} from "./NativeLocale";

import {Language} from "@typing/locale";

export default class CustomLocale extends AbstractLocale<LocaleNativeStructure> {
    constructor(
        protected _lang: Language = Language.English,
        protected data: Record<string, string> = {}
    ) {
        super();
    }

    public setLang(lang: Language): this {
        this._lang = lang;
        return this
    }

    public setData(data: Record<string, string>): this {
        this.data = data;
        return this
    }

    public lang(): Language {
        return this._lang;
    }

    public keys() {
        return new Set(Object.keys(this.data));
    }

    public value(key: string) {
        const value = this.data[convertLocaleKey(key)];

        if (!value || value.length === 0) {
            return undefined;
        }

        return value;
    }
}
