import {getLocaleFilename} from "../utils";

import NativeLocale, {LocaleNativeStructure} from "./NativeLocale";
import CustomLocale from "./CustomLocale";

import {Language, LocaleDynamicProvider} from "@typing/locale";

export default class DynamicLocale extends NativeLocale implements LocaleDynamicProvider<LocaleNativeStructure> {
    protected customLocale?: CustomLocale;

    public async change(lang: Language): Promise<void> {

        const messages = await (await fetch(getLocaleFilename(lang))).json()

        if (messages && messages instanceof Object) {
            this.customLocale ??= new CustomLocale(lang, messages);
            this.customLocale.change(lang, messages);
            return
        } else {
            throw new Error(`Data is empty for "${lang}" language`)
        }
    }

    public lang(): Language {
        return this.customLocale?.lang() || super.lang()
    }

    protected value(key: Extract<keyof LocaleNativeStructure, string>): string | undefined {
        return this.customLocale?.value(key) || super.value(key);
    }
}
