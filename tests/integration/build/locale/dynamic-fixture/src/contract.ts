import {DynamicLocale, Language} from "adnbn/locale";

export const checkContract = (locale: DynamicLocale): void => {
    const changed: Promise<Language> = locale.change(Language.French);
    const synced: Promise<Language> = locale.sync();
    const stop: () => void = locale.watch(language => {
        const selected: Language = language;
    });
    locale.unwatch();
    const translated: string = locale.trans("welcome", {name: "Ada"});
    const plural: string = locale.choice("items", 2, {count: 2});
    const keys: ReadonlySet<"locale" | "greeting" | "app.title" | "welcome" | "items" | "fallback" | "empty"> =
        locale.keys();
    // @ts-expect-error substitutions remain required
    locale.trans("welcome");
    // @ts-expect-error plural keys are not ordinary messages
    locale.trans("items", {count: 2});
    // @ts-expect-error ordinary messages cannot use choice
    locale.choice("greeting", 2);
    // @ts-expect-error unknown substitution names are rejected
    locale.trans("welcome", {name: "Ada", extra: "value"});
};
