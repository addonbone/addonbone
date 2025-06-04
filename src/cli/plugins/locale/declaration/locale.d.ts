import ':package';
import {
    Language,
    LocaleDir,
    type LocaleNonPluralKeys,
    type LocalePluralKeys,
    type LocaleSubstitutionsFor
} from ":package/locale";

declare module ':package' {
    export interface LocaleNativeStructure {}

    export function _<K extends LocaleNonPluralKeys<LocaleNativeStructure>>(
        key: K,
        substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>,
    ): string;

    export function _c<K extends LocalePluralKeys<LocaleNativeStructure>>(
        key: K,
        count: number,
        substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>,
    ): string;

    export function __(key: keyof LocaleNativeStructure & string): string;
}

declare module ':package/locale/react' {
    import type {LocaleNativeStructure} from ':package'

    export interface LocaleContract {
        lang: Language;

        dir: LocaleDir;

        isRtl: boolean;

        _<K extends LocaleNonPluralKeys<LocaleNativeStructure>>(key: K, substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>): string;

        choice<K extends LocalePluralKeys<LocaleNativeStructure>>(key: K, count: number, substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>): string;

        change(lang: Language): void;
    }

    export function useLocale(): LocaleContract
}
