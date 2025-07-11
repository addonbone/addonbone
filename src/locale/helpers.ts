import {LocaleNativeStructure, NativeLocale} from "@locale/providers";
import {convertLocaleMessageKey, extractLocaleKey} from "@locale/utils";
import {LocaleNonPluralKeys, LocalePluralKeys, LocaleSubstitutionsFor} from "@typing/locale";

/**
 * Translates a given locale key into the corresponding localized string.
 *
 * @template K - A type representing the non-plural keys of the locale structure.
 * @param {K} key - The locale key to be translated.
 * @param {LocaleSubstitutionsFor<LocaleNativeStructure, K>} [substitutions] - Optional substitutions to be applied
 * within the localized string. These are typically placeholders replaced with dynamic values.
 * @returns {string} - The translated string for the given key, with substitutions applied if provided.
 */
export const _ = <K extends LocaleNonPluralKeys<LocaleNativeStructure>>(
    key: K,
    substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>
): string => {
    return NativeLocale.getInstance().trans(key, substitutions);
};

/**
 * Translates a given locale key into the corresponding localized string
 * based on a specific count for pluralization.
 *
 * @template K - A type representing the non-plural keys of the locale structure.
 * @param {K} key - The locale key to be translated.
 * @param {number} count - The count used to determine the pluralization form.
 * @param {LocaleSubstitutionsFor<LocaleNativeStructure, K>} [substitutions] - Optional substitutions to be applied
 * within the localized string. These are typically placeholders replaced with dynamic values.
 * @returns {string} - The translated string for the given key, adjusted for pluralization and with substitutions applied if provided.
 */
export const _c = <K extends LocalePluralKeys<LocaleNativeStructure>>(
    key: K,
    count: number,
    substitutions?: LocaleSubstitutionsFor<LocaleNativeStructure, K>
): string => {
    return NativeLocale.getInstance().choice(key, count, substitutions);
};

/**
 * Converts a locale key into a standardized format and logs a warning if the key is not found
 * in the current language's locale keys.
 *
 * @param {Extract<keyof LocaleNativeStructure, string>} key - The locale key to be converted.
 * This key must be a string and exist within the `LocaleNativeStructure`.
 * @returns {string} - The converted locale message key.
 */
export const __ = (key: keyof LocaleNativeStructure & string): string => {
    const locale = NativeLocale.getInstance();

    if (!locale.keys().has(key)) {
        console.warn(`Locale key "${key}" not found in "${locale.lang()}" language.`);
    }

    return convertLocaleMessageKey(key);
};

/**
 * Attempts to extract a locale key from the provided string and translates it
 * into the corresponding localized string. If no locale key can be extracted,
 * the original string is returned.
 *
 * @param {string} input - The input string from which a locale key is to be extracted.
 * @returns {string} - The translated string if a locale key is successfully extracted,
 * or the original string if no locale key is found.
 */
export const __t = (input: string): string => {
    const localeKey = extractLocaleKey(input);

    if (localeKey) {
        return _(localeKey as LocaleNonPluralKeys<LocaleNativeStructure>);
    }

    return input;
};

