import {browser} from "./browser";
import {getManifest, throwRuntimeError} from "./runtime";

type LanguageDetectionResult = chrome.i18n.LanguageDetectionResult

const i18n = () => browser().i18n as typeof chrome.i18n;

// Methods
export const detectI18Language = (text: string): Promise<LanguageDetectionResult> => new Promise<LanguageDetectionResult>((resolve, reject) => {
    i18n().detectLanguage(text, result => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getI18nAcceptLanguages = (): Promise<string[]> => new Promise<string[]>((resolve, reject) => {
    i18n().getAcceptLanguages(locales => {
        try {
            throwRuntimeError();

            resolve(locales);
        } catch (e) {
            reject(e);
        }
    });
});

export const getI18nMessage = (key: string): string | undefined => {
    if (!canUseNativeI18nMessage()) {
        return;
    }

    return i18n().getMessage(key);
}


// Custom Methods
export const canUseNativeI18nMessage = (): boolean => typeof (i18n().getMessage) !== "undefined";

export const getI18nUILanguage = (): string | undefined => {
    const i18n = browser().i18n;

    if (!i18n['getUILanguage']) {
        return;
    }

    return i18n.getUILanguage();
}

export const getDefaultLanguage = (): string | undefined => getManifest().default_locale;