import ':package';
import type {LocaleNonPluralKeys, LocalePluralKeys, LocaleSubstitutionsFor} from ":package/locale";

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