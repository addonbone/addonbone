import path from "path";

import {LanguageCodes, LocaleFileExtensions} from "@typing/locale";

export const isValidLocaleFilename = (filename: string): boolean => {
    let {name, ext} = path.parse(filename);

    if (ext.startsWith('.')) {
        ext = ext.slice(1);
    }

    return LocaleFileExtensions.has(ext) && LanguageCodes.has(name);
}