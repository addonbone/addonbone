import {LocaleProvider} from "@typing/locale";
import LocaleNative, {type LocaleNativeStructure} from "./LocaleNative";

export const createLocale = (): LocaleProvider<LocaleNativeStructure> => new LocaleNative;

export {default as LocaleAbstract} from "./LocaleAbstract";

export {Language, LanguageCodes, LocaleDir} from "@typing/locale";
export type {LocaleNativeStructure};