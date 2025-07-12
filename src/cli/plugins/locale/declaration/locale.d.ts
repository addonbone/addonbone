import {
    Language,
    LocaleDir,
    type LocaleNonPluralKeys,
    type LocalePluralKeys,
    type LocaleProvider,
    type LocaleDynamicProvider,
    type LocaleSubstitutionsFor,
} from ":package/locale";

declare module ":package/locale" {
    // prettier-ignore
    export interface GeneratedNativeStructure {}

    export function _<K extends LocaleNonPluralKeys<GeneratedNativeStructure>>(
        key: K,
        substitutions?: LocaleSubstitutionsFor<GeneratedNativeStructure, K>
    ): string;

    export function _c<K extends LocalePluralKeys<GeneratedNativeStructure>>(
        key: K,
        count: number,
        substitutions?: LocaleSubstitutionsFor<GeneratedNativeStructure, K>
    ): string;

    export function __(key: keyof GeneratedNativeStructure & string): string;

    export declare class NativeLocale implements LocaleProvider<GeneratedNativeStructure> {
        lang(): Language;

        languages(): Set<Language>;

        keys(): ReadonlySet<keyof GeneratedNativeStructure>;

        // non-plural keys
        trans<K extends LocaleNonPluralKeys<GeneratedNativeStructure>>(
            key: K,
            substitutions?: LocaleSubstitutionsFor<GeneratedNativeStructure, K>
        ): string;

        // plural keys
        choice<K extends LocalePluralKeys<GeneratedNativeStructure>>(
            key: K,
            count: number,
            substitutions?: LocaleSubstitutionsFor<GeneratedNativeStructure, K>
        ): string;
    }

    export declare class DynamicLocale extends NativeLocale implements LocaleDynamicProvider<GeneratedNativeStructure> {
        change(lang: Language): Promise<Language>;
    }
}

declare module ":package/locale/react" {
    import type {GeneratedNativeStructure} from ":package/locale";

    export interface LocaleContract {
        lang: Language;

        dir: LocaleDir;

        isRtl: boolean;

        _<K extends LocaleNonPluralKeys<GeneratedNativeStructure>>(
            key: K,
            substitutions?: LocaleSubstitutionsFor<GeneratedNativeStructure, K>
        ): string;

        choice<K extends LocalePluralKeys<GeneratedNativeStructure>>(
            key: K,
            count: number,
            substitutions?: LocaleSubstitutionsFor<GeneratedNativeStructure, K>
        ): string;

        change(lang: Language): void;
    }

    export function useLocale(): LocaleContract;
}
