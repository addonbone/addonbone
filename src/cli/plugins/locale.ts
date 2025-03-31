import fs from "fs";

import {definePlugin} from "@core/define";

import {isValidLocaleFilename} from "@cli/utils/locale";

import {ReadonlyConfig} from "@typing/config";
import {getAppsPath, getRootPath, getSharedPath} from "@cli/resolvers/path";
import path from "path";

const findLocaleFiles = (directory: string): Set<string> => {
    const files = new Set<string>;

    try {
        for (let file of files) {
            file = path.join(directory, file);

            if (fs.statSync(file).isFile() && isValidLocaleFilename(file)) {
                files.add(file);
            }
        }
    } catch {}

    return new Set(files);
}

const getLocaleFiles = (config: ReadonlyConfig): Set<string> => {
    return findLocaleFiles(getRootPath(getAppsPath(config, config.localeDir)));
}

export default definePlugin(() => {


    return {
        name: 'adnbn:locale',
        bundler: ({config}) => {
            console.log(getLocaleFiles(config));

            return {};
        }
    };
});