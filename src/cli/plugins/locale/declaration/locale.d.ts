import ":package";
import {
    Language,
    LocaleDir,
    type LocaleNonPluralKeys,
    type LocalePluralKeys,
    type LocaleProvider,
    type LocaleDynamicProvider,
    type LocaleSubstitutionsFor,
} from ":package/locale";

declare module ":package" {
    // prettier-ignore
    export interface LocaleNativeStructure {}

    export function _<K extends LocaleNonPluralKeys<LocaleNativeStructure>>(
        key: K,
        substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>
    ): string;

    export function _c<K extends LocalePluralKeys<LocaleNativeStructure>>(
        key: K,
        count: number,
        substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>
    ): string;

    export function __(key: keyof LocaleNativeStructure & string): string;
}

declare module ":package/locale" {
    import type {LocaleNativeStructure} from ":package";

    export declare class NativeLocale implements LocaleProvider<LocaleNativeStructure> {
        lang(): Language;

        languages(): Set<Language>;

        keys(): ReadonlySet<keyof LocaleNativeStructure>;

        // non-plural keys
        trans<K extends LocaleNonPluralKeys<LocaleNativeStructure>>(
            key: K,
            substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>
        ): string;

        // plural keys
        choice<K extends LocalePluralKeys<LocaleNativeStructure>>(
            key: K,
            count: number,
            substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>
        ): string;
    }

    export declare class DynamicLocale extends NativeLocale implements LocaleDynamicProvider<LocaleNativeStructure> {
        change(lang: Language): Promise<Language>;
    }
}

declare module ":package/locale/react" {
    import type {LocaleNativeStructure} from ":package";

    export interface LocaleContract {
        lang: Language;

        dir: LocaleDir;

        isRtl: boolean;

        _<K extends LocaleNonPluralKeys<LocaleNativeStructure>>(
            key: K,
            substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>
        ): string;

        choice<K extends LocalePluralKeys<LocaleNativeStructure>>(
            key: K,
            count: number,
            substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>
        ): string;

        change(lang: Language): void;
    }

    export function useLocale(): LocaleContract;
}
