import type {LocaleCatalogue} from "./types";

export const LocaleModuleName = "virtual/locale";

export const createLocaleModule = (catalogue: LocaleCatalogue): string =>
    // Parse serialized JSON to preserve own keys such as __proto__ in the exported object.
    `export default JSON.parse(${JSON.stringify(JSON.stringify(catalogue))});\n`;
