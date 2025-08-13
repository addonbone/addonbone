import {decryptData} from "@cli/plugins/dotenv/crypt";

import {Browser} from "@typing/browser";
import {ManifestVersion} from "@typing/manifest";

export const getEnv: {
    <T extends string>(key: string): T | undefined;
    <T extends string, D>(key: string, defaults: D): T | D;
} = (() => {
    let envCache: object;

    return (key: string, defaults?: string) => {
        let env: object;

        if (typeof process.env === "object") {
            env = process.env;
        } else {
            envCache ??= decryptData(process.env);
            env = envCache;
        }

        return (env[key] ?? defaults) as any;
    };
})();

export const getApp = (): string => {
    const app = getEnv("APP");

    if (app === undefined) {
        throw new Error("App is not defined");
    }

    return app;
};

export const getBrowser = (): Browser => {
    const browser = getEnv<Browser>("BROWSER");

    if (browser === undefined) {
        throw new Error("Browser is not defined");
    }

    return browser;
};

export const isBrowser = (browser: Browser): browser is Browser => {
    return getBrowser() === browser;
};

export const getManifestVersion = (): ManifestVersion => {
    const manifestVersion = getEnv("MANIFEST_VERSION", "3");

    return parseInt(manifestVersion) as ManifestVersion;
};
