import {createContext, useContext} from "react";

import {
    LocaleDir,
    Language,
    LocaleNonPluralKeys,
    LocaleStructure,
    LocaleSubstitutionsFor,
    LocalePluralKeys
} from "@typing/locale";

import {LocaleNativeStructure} from "@locale/providers";

export interface LocaleContract<S extends LocaleStructure = LocaleNativeStructure> {
    lang: Language;

    dir: LocaleDir;

    isRtl: boolean;

    _<K extends LocaleNonPluralKeys<S> >(key: K, substitutions?: LocaleSubstitutionsFor<S, K>): string;

    choice<K extends LocalePluralKeys<S>>(key: K, count: number, substitutions?: LocaleSubstitutionsFor<S, K>): string;

    change(lang: Language): void;
}

export const DefaultLocale: LocaleContract = {
    lang: Language.English,
    isRtl: false,
    dir: LocaleDir.LeftToRight,
    _(key: string): string {
        return key as string;
    },
    choice(key: string): string {
        return key;
    },
    change(_lang: Language)  {
    }
};

export const LocaleContext = createContext<LocaleContract>(DefaultLocale);

LocaleContext.displayName = "LocaleContext";

export const useLocale = () => useContext(LocaleContext);
