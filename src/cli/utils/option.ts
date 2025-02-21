import {EntrypointOptions} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";

export const isValidEntrypointOptions = (options: EntrypointOptions, config: ReadonlyConfig): boolean => {
    const {browser, app} = config;

    if (options.includeBrowser?.includes(browser) || options.includeApp?.includes(app)) {
        return true;
    }

    return !(options.excludeBrowser?.includes(browser) || options.excludeApp?.includes(app));
}