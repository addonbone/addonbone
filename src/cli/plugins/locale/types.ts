import type {Language} from "@typing/locale";

export type LocaleCatalogue = Partial<Record<Language, Record<string, string>>>;
