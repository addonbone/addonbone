import {convertLocaleKey} from "../utils";

import AbstractLocale from "./AbstractLocale";
import {LocaleNativeStructure} from "./NativeLocale";

import {Language} from "@typing/locale";

export default class CustomLocale extends AbstractLocale<LocaleNativeStructure> {
    constructor(protected _lang: Language, protected messages: Record<string, string>) {
        super();
    }

    public change(lang: Language, messages: Record<string, string>): void {
        this._lang = lang;
        this.messages = messages;
    }

    public lang(): Language {
        return this._lang;
    }

    public keys() {
        return new Set(Object.keys(this.messages));
    }

    public value(key: string) {
        const value = this.messages[convertLocaleKey(key)];

        if (!value || value.length === 0) {
            return undefined;
        }

        return value;
    }
}
