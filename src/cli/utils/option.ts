import {BaseEntrypointOptions} from "@typing/base";
import {ReadonlyConfig} from "@typing/config";

export const isValidEntrypointOptions = (options: BaseEntrypointOptions, config: ReadonlyConfig): boolean => {
    const {browser, app} = config;

    if (options.includeBrowser?.includes(browser) || options.includeApp?.includes(app)) {
        return true;
    }

    return !(options.excludeBrowser?.includes(browser) || options.excludeApp?.includes(app));
}