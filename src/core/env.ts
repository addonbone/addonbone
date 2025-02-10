import {Browser} from "@typing/config";
import {ManifestVersion} from "@typing/manifest";

const env = process.env;

export const getEnv: {
    <T extends string>(key: string): T | undefined;
    <T extends string, D>(key: string, defaults: D): T | D;
} = (key: string, defaults?: string) => {
    return (env[key] ?? defaults) as any;
};

export const getBrowser = (): Browser => {
    const browser = getEnv<Browser>('BROWSER');

    if (browser === undefined) {
        throw new Error('Browser is not defined');
    }

    return browser;
}

export const getManifestVersion = (): ManifestVersion => {
    const manifestVersion = getEnv('MANIFEST_VERSION', '3');

    return parseInt(manifestVersion) as ManifestVersion;
}