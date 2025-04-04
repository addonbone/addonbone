import fs from "fs";
import path from "path";
import _ from "lodash";

import {definePlugin} from "@core/define";

import {processPluginHandler} from "@cli/resolvers/plugin";
import {getAppPath, getAppSourcePath, getRootPath, getSharedPath, getSourcePath} from "@cli/resolvers/path";

import {getLanguageFromFilename, isValidLocaleFilename} from "@cli/utils/locale";

import {ReadonlyConfig} from "@typing/config";
import {LanguageCodes, LocaleDirectoryName} from "@typing/locale";


const findLocaleFiles = (directory: string): Set<string> => {
    const files = new Set<string>;

    try {
        const entries = fs.readdirSync(directory);

        for (const entry of entries) {
            const fullPath = path.join(directory, entry);
            const stats = fs.statSync(fullPath);

            if (stats.isFile() && isValidLocaleFilename(fullPath)) {
                files.add(fullPath);
            }
        }
    } catch {
    }

    return new Set(files);
}

const getLocaleFiles = (config: ReadonlyConfig): Set<string> => {
    const files = new Set<string>;

    const parser = (directory: string): void => {
        if (files.size === 0 || config.mergeLocales) {
            const localeFiles = findLocaleFiles(getRootPath(directory));

            for (const file of localeFiles) {
                files.add(file);
            }
        }
    };

    parser(getAppSourcePath(config, config.localeDir));
    parser(getAppPath(config, config.localeDir));
    parser(getSharedPath(config, config.localeDir));
    parser(getSourcePath(config, config.localeDir));

    return files;
}


const getVendorLocaleFiles = (config: ReadonlyConfig, name: string, directory: string): Set<string> => {
    const files: Array<string | undefined> = [];

    const resolve = (file: string): string | undefined => {
        try {
            return require.resolve(path.posix.join(name, directory, file), {paths: [process.cwd()]});
        } catch {
        }
    }

    for (const code of LanguageCodes) {
        files.push(
            resolve(code),
            resolve(`${code}.${config.browser}`),
        );
    }

    return new Set(files.filter(Boolean) as string[]);
}

const getPluginLocaleFiles = async (config: ReadonlyConfig): Promise<Set<string>> => {
    const pluginResult = await Array.fromAsync(processPluginHandler(config, 'locale', {
        config,
    }));

    const files = pluginResult.reduce((files, {name, result}) => {
        if (_.isBoolean(result)) {
            result = LocaleDirectoryName;
        }

        if (_.isString(result)) {
            result = getVendorLocaleFiles(config, name, result);
        }

        if (_.isArray(result) || _.isSet(result)) {
            for (const file of result) {
                if (_.isString(file) && !_.isEmpty(result)) {
                    files.push(file);
                }
            }
        }

        return files;
    }, [] as string[]).filter(file => {
        const {name} = path.parse(file);

        if (name.includes('.')) {
            return name.includes(`.${config.browser}`);
        }

        return true;
    });

    return new Set(files);
}

const getLocaleEntries = async (config: ReadonlyConfig) => {
    const localeFiles = await getPluginLocaleFiles(config);

    const localeByLanguage = _.groupBy(Array.from(localeFiles), (file) => getLanguageFromFilename(file));

    console.log(localeByLanguage);
}

export default definePlugin(() => {


    return {
        name: 'adnbn:locale',
        locale: ({config}) => getLocaleFiles(config),
        bundler: async ({config}) => {
            const localeEntries = await getLocaleEntries(config);


            return {};
        }
    };
});