import {Language, type LocaleCatalogue} from "@typing/locale";

/** Package fallback; extension builds replace #adnbn/locale with virtual/locale. */
const catalogue: LocaleCatalogue = {};

export const lang: Language = Language.English;
export const keys: readonly string[] = [];
export const languages: readonly Language[] = [];

export default catalogue;
