import path from "path";

import {Language, LanguageCodes, LocaleFileExtensions} from "@typing/locale";

export const isValidLocaleFilename = (filename: string): boolean => {
    let {name, ext} = path.parse(filename);

    if (ext.startsWith('.')) {
        ext = ext.slice(1);
    }

    if (name.includes('.')) {
        name = name.split('.').slice(0, -1).join('.');
    }

    return LocaleFileExtensions.has(ext) && LanguageCodes.has(name);
}

export const getLanguageFromFilename = (filename: string): Language => {
    let {name} = path.parse(filename);

    if (name.includes('.')) {
        name = name.split('.').slice(0, -1).join('.');
    }

    if (LanguageCodes.has(name)) {
        return name as Language;
    }

    throw new Error(`Invalid locale filename: ${filename}`);
}