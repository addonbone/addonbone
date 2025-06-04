import {flattenLocaleMessages, getLocaleFilename} from "../utils";

import {Storage} from "../../storage";

import NativeLocale, {LocaleNativeStructure} from "./NativeLocale";
import CustomLocale from "./CustomLocale";

import {Language, LanguageCodes, LocaleDynamicProvider} from "@typing/locale";

export default class DynamicLocale extends NativeLocale implements LocaleDynamicProvider<LocaleNativeStructure> {
    protected customLocale?: CustomLocale;
    protected storage: Storage<Record<string, Language>>;

    constructor(protected storageKey: string = 'lang') {
        super();
        this.storage = new Storage<Record<typeof storageKey, Language>>()
    }

    public async change(lang: Language): Promise<Language> {
        if (lang === this.lang()) return lang

        const messages = await (await fetch(getLocaleFilename(lang))).json()

        if (messages && messages instanceof Object) {
            this.customLocale ??= new CustomLocale();
            this.customLocale
                .setLang(lang)
                .setData(flattenLocaleMessages(messages));

            await this.storage.set(this.storageKey, lang);
            return lang
        } else {
            throw new Error(`Data is empty for "${lang}" language`)
        }
    }

    public async sync(): Promise<Language> {
        const lang = await this.storage.get(this.storageKey);

        if (!lang) return this.lang()

        if (!LanguageCodes.has(lang)) {
            console.warn(`Incorrect language code in storage - "${lang}"`)
            return this.lang()
        }

        await this.change(lang);

        return lang
    }

    public lang(): Language {
        return this.customLocale?.lang() || super.lang()
    }

    protected value(key: Extract<keyof LocaleNativeStructure, string>): string | undefined {
        return this.customLocale?.value(key) || super.value(key);
    }
}
