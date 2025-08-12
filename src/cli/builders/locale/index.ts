import LocaleBuilder from "./LocaleBuilder";
import LocaleValidator from "./LocaleValidator";

import {extractLocaleKey} from "@locale/utils";

import {Language, LocaleBuilder as LocaleBuilderContract} from "@typing/locale";
import {ReadonlyConfig} from "@typing/config";

export {LocaleBuilder, LocaleValidator};

export default (language: Language, config: ReadonlyConfig): LocaleBuilderContract => {
    const {browser, name, shortName, description} = config;

    const validator = new LocaleValidator(browser, language)
        .setNameKey(extractLocaleKey(name))
        .setShortNameKey(extractLocaleKey(shortName))
        .setDescriptionKey(extractLocaleKey(description));

    return new LocaleBuilder(browser, language).setValidator(validator);
};
