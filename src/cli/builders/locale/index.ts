import {Language, LocaleBuilder} from "@typing/locale";
import {Browser} from "@typing/browser";
import LocaleBase from "./LocaleBase";

export default (language: Language, browser: Browser): LocaleBuilder => {
    return new LocaleBase(language);
};