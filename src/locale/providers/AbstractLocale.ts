import {
    Language,
    LocaleKeys,
    LocaleNonPluralKeysOf,
    LocalePluralKeysOf,
    LocaleProvider,
    LocaleStructure,
    LocaleValuesSeparator,
    SubstitutionsFor
} from "@typing/locale";

export default abstract class AbstractLocale<S extends LocaleStructure> implements LocaleProvider<S> {
    public abstract lang(): Language;

    public abstract keys(): LocaleKeys;

    protected abstract value(key: Extract<keyof S, string>): string | undefined;

    public choice<K extends LocalePluralKeysOf<S>>(key: K, count: number, substitutions?: SubstitutionsFor<S, K>): string {
        const value = this.get(key, substitutions).split(LocaleValuesSeparator);

        const index = this.getPluralIndex(count);

        return value[index] || value[0] || (key as string);
    }

    public trans<K extends LocaleNonPluralKeysOf<S>>(key: K, substitutions?: SubstitutionsFor<S, K>): string {
        return this.get(key, substitutions);
    }

    public get<K extends Extract<keyof S, string>>(key: K, substitutions?: SubstitutionsFor<S, K>): string {
        const value = this.value(key);

        if (!value) {
            console.warn(`Locale key "${key as string}" not found in "${this.lang()}" language.`);

            return key as string;
        }

        if (substitutions) {
            return value.replace(/{{(.*?)}}/g, (_, substitution) => {
                if (substitution in substitutions) {
                    return substitutions[substitution].toString();
                }

                console.warn(`Locale substitution "${substitution}" not found for key "${key as string}" in "${this.lang()}" language.`);

                return substitution;
            });
        }

        return value;
    }

    private getPluralIndex(count: number): number {
        switch (this.lang()) {
            case Language.Indonesian:
            case Language.Japanese:
            case Language.Kannada:
            case Language.Korean:
            case Language.Malay:
            case Language.Thai:
            case Language.Turkish:
            case Language.Vietnamese:
                return 0;

            case Language.Bengali:
            case Language.Bulgarian:
            case Language.Catalan:
            case Language.Danish:
            case Language.German:
            case Language.Greek:
            case Language.English:
            case Language.EnglishAustralia:
            case Language.EnglishGreatBritain:
            case Language.EnglishUSA:
            case Language.Spanish:
            case Language.SpanishLatinAmericaAndCaribbean:
            case Language.Estonian:
            case Language.Persian:
            case Language.Finnish:
            case Language.Gujarati:
            case Language.Hebrew:
            case Language.Hungarian:
            case Language.Italian:
            case Language.Malayalam:
            case Language.Marathi:
            case Language.Dutch:
            case Language.Norwegian:
            case Language.Swedish:
            case Language.Swahili:
            case Language.Tamil:
            case Language.Telugu:
            case Language.ChineseChina:
            case Language.ChineseTaiwan:
            case Language.PortugueseBrazil:
            case Language.PortuguesePortugal:
                return (count == 1) ? 0 : 1;

            case Language.Amharic:
            case Language.Filipino:
            case Language.French:
            case Language.Hindi:
                return ((count == 0) || (count == 1)) ? 0 : 1;

            case Language.Croatian:
            case Language.Russian:
            case Language.Serbian:
            case Language.Ukrainian:
                return ((count % 10 == 1) && (count % 100 != 11)) ? 0 : (((count % 10 >= 2) && (count % 10 <= 4) && ((count % 100 < 10) || (count % 100 >= 20))) ? 1 : 2);

            case Language.Czech:
            case Language.Slovak:
                return (count == 1) ? 0 : (((count >= 2) && (count <= 4)) ? 1 : 2);

            case Language.Lithuanian:
                return ((count % 10 == 1) && (count % 100 != 11)) ? 0 : (((count % 10 >= 2) && ((count % 100 < 10) || (count % 100 >= 20))) ? 1 : 2);

            case Language.Slovenian:
                return (count % 100 == 1) ? 0 : ((count % 100 == 2) ? 1 : (((count % 100 == 3) || (count % 100 == 4)) ? 2 : 3));

            case Language.Latvian:
                return (count == 0) ? 0 : (((count % 10 == 1) && (count % 100 != 11)) ? 1 : 2);

            case Language.Polish:
                return (count == 1) ? 0 : (((count % 10 >= 2) && (count % 10 <= 4) && ((count % 100 < 12) || (count % 100 > 14))) ? 1 : 2);

            case Language.Romanian:
                return (count == 1) ? 0 : (((count == 0) || ((count % 100 > 0) && (count % 100 < 20))) ? 1 : 2);

            case Language.Arabic:
                return (count == 0) ? 0 : ((count == 1) ? 1 : ((count == 2) ? 2 : (((count % 100 >= 3) && (count % 100 <= 10)) ? 3 : (((count % 100 >= 11) && (count % 100 <= 99)) ? 4 : 5))));

            default:
                return 0;
        }
    }

}

