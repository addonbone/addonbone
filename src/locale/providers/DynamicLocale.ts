import {flattenLocaleMessages, getLocaleFilename} from "../utils";

import {Storage} from "../../storage";

import NativeLocale, {LocaleNativeStructure} from "./NativeLocale";
import CustomLocale from "./CustomLocale";

import {Language, LanguageCodes, LocaleDynamicProvider} from "@typing/locale";

export default class<T extends LocaleNativeStructure> extends NativeLocale implements LocaleDynamicProvider<T> {
    protected unsubscribe?: () => void
    protected locale?: CustomLocale<T>;
    protected storage?: Storage<Record<string, Language>>;
    protected storageKey?: string;

    constructor(storage: string | false = 'lang') {
        super();

        if (storage) {
            this.storageKey = storage;
            this.storage = new Storage();
        }
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

            if (this.storage && this.storageKey) {
                await this.storage.set(this.storageKey, lang);
            }

            return lang;
        }

        throw new Error(`Data is empty for "${lang}" language`);
    }

    public async sync(): Promise<Language> {
        if (!this.storage || !this.storageKey) {
            throw new Error('Language is not saving in storage')
        }

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

    public watch(handler?: (lang: Language) => void): () => void {
        if (!this.storage || !this.storageKey) {
            throw new Error('Language is not saved in storage')
        }

        if (this.unsubscribe) {
            throw new Error('Already subscribed to language changes in storage')
        }

        this.unsubscribe = this.storage.watch({
            [this.storageKey]: (newValue) => {
                if (newValue) {
                    this.change(newValue)
                        .then(() => handler && handler(newValue))
                        .catch((err) => console.error('Error while changing language:',err));
                }
            }
        })

        return this.unwatch.bind(this);
    }

    public unwatch(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    }

    public lang(): Language {
        return this.locale?.lang() || super.lang();
    }

    protected value(key: Extract<keyof LocaleNativeStructure, string>): string | undefined {
        return this.locale?.get(key) || super.value(key);
    }
}
