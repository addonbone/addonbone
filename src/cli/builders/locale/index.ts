import LocaleBuilder from "./LocaleBuilder";
import LocaleValidator from "./LocaleValidator";

import {Language, LocaleBuilder as LocaleBuilderContract} from "@typing/locale";
import {ReadonlyConfig} from "@typing/config";

export {LocaleBuilder, LocaleValidator};

export default (language: Language, config: ReadonlyConfig): LocaleBuilderContract => {
    const {browser, locale} = config;
    const {nameKey, shortNameKey, descriptionKey} = locale;

    const validator = new LocaleValidator(browser, language)
        .setNameKey(nameKey)
        .setDescriptionKey(descriptionKey)
        .setShortNameKey(shortNameKey);

    return new LocaleBuilder(browser, language).setValidator(validator);
};