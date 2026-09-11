import type {Language, LocaleStorageDriver} from "@typing/locale";

export const createLocaleStorage = (initial?: Language): LocaleStorageDriver => {
    let value = initial;
    const listeners = new Set<(lang: Language) => void>();

    return {
        async get() {
            return value;
        },
        async set(lang) {
            value = lang;
            for (const handler of listeners) handler(lang);
        },
        watch(handler) {
            listeners.add(handler);
            return () => {
                listeners.delete(handler);
            };
        },
    };
};
