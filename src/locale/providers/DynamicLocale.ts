import {flattenLocaleMessages, getLocaleFilename} from "../utils";

import {Storage} from "../../storage";

import NativeLocale, {LocaleNativeStructure} from "./NativeLocale";
import CustomLocale from "./CustomLocale";

import {Language, LanguageCodes, LocaleDynamicProvider} from "@typing/locale";

export default class<T extends LocaleNativeStructure> extends NativeLocale implements LocaleDynamicProvider<T> {
    protected locale?: CustomLocale<T>;
    protected storage: Storage<Record<string, Language>>;

    constructor(protected storageKey: string = 'lang') {
        super();

        this.storage = new Storage<Record<typeof storageKey, Language>>();
    }

    public async change(lang: Language): Promise<Language> {
        if (lang === this.lang()) {
            return lang;
        }

        const messages = await (await fetch(getLocaleFilename(lang))).json();

        if (messages && messages instanceof Object) {
            this.locale ??= new CustomLocale();

            this.locale
                .setLang(lang)
                .setData(flattenLocaleMessages(messages));

            await this.storage.set(this.storageKey, lang);

            return lang;
        }

        throw new Error(`Data is empty for "${lang}" language`);
    }

    public async sync(): Promise<Language> {
        const lang = await this.storage.get(this.storageKey);

        if (!lang) {
            return this.lang();
        }

        if (!LanguageCodes.has(lang)) {
            console.warn(`Incorrect language code in storage - "${lang}"`);

            return this.lang();
        }

        return this.change(lang);
    }

    public lang(): Language {
        return this.locale?.lang() || super.lang();
    }

    protected value(key: Extract<keyof LocaleNativeStructure, string>): string | undefined {
        return this.locale?.get(key) || super.value(key);
    }
}
