import type {LocaleMessages} from "@typing/locale";

export const flattenLocaleMessages = (messages: LocaleMessages): Record<string, string> =>
    Object.fromEntries(Object.entries(messages).map(([key, value]) => [key, value.message]));
