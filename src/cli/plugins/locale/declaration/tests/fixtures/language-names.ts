import {Language, NativeLocale, DynamicLocale, type LocaleProvider} from "adnbn/locale";
import {useLocale} from "adnbn/locale/react";

const native: Map<Language, string> = new NativeLocale().languageNames();
const dynamic: Map<Language, string> = new DynamicLocale().languageNames();
declare const provider: LocaleProvider<{}>;
const providerNames: Map<Language, string> = provider.languageNames();
const available: Set<Language> = new NativeLocale().languages();
const names: ReadonlyMap<Language, string> = useLocale().langs;
const title: string | undefined = names.get(Language.French);
// @ts-expect-error React exposes a read-only map
useLocale().langs.set(Language.French, "Changed");
// @ts-expect-error only providers retain the languageNames method
useLocale().languageNames;
// @ts-expect-error keys are Language values, not arbitrary strings
native.get("unsupported");
