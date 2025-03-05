import {Browser} from "@typing/browser";
import {getEnv} from "@core/env";

export const browser = (): typeof chrome => {
    return chrome;
}

export const getBrowser = (): Browser => {
    return getEnv('BROWSER', Browser.Chrome);
}

export const isBrowser = (browser: Browser): boolean => {
    return getBrowser() === browser;
}