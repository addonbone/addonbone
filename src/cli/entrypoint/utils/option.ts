import {EntrypointOptions} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";

export const isValidEntrypointOptions = (options: EntrypointOptions, config: ReadonlyConfig): boolean => {
    const {browser, app} = config;
    const {includeBrowser = [], includeApp = [], excludeBrowser = [], excludeApp = []} = options;

    if (includeBrowser.length > 0 && !includeBrowser.includes(browser)) {
        return false;
    }

    if (includeApp.length > 0 && !includeApp.includes(app)) {
        return false;
    }

    if (excludeBrowser.length > 0 && excludeBrowser.includes(browser)) {
        return false;
    }

    return !(excludeApp.length > 0 && excludeApp.includes(app));
}