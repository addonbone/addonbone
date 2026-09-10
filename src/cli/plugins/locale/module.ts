import type {LocaleCatalogue} from "@typing/locale";

export const createLocaleModule = (catalogue: LocaleCatalogue, keys: ReadonlySet<string>): string =>
    // JSON.parse preserves own __proto__ keys; the pure annotation lets native consumers omit the catalogue.
    `export const keys = ${JSON.stringify([...keys])};\n` +
    `export const languages = ${JSON.stringify(Object.keys(catalogue))};\n` +
    `export default /*#__PURE__*/ JSON.parse(${JSON.stringify(JSON.stringify(catalogue))});\n`;
