import {convertLocaleKey} from "../utils";

import AbstractLocale from "./AbstractLocale";
import {LocaleNativeStructure} from "./NativeLocale";

import {Language, LocaleMessages} from "@typing/locale";

export default class CustomLocale extends AbstractLocale<LocaleNativeStructure> {
    constructor(protected _lang: Language, protected messages: LocaleMessages) {
        super();
    }

    public change(lang: Language, messages: LocaleMessages): void {
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
        const value = this.messages[convertLocaleKey(key)]?.message;

        if (!value || value.length === 0) {
            return undefined;
        }

        return value;
    }
}
