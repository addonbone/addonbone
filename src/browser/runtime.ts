import _isUndefined from "lodash/isUndefined";

import {browser} from "./env";

type Manifest = chrome.runtime.Manifest;

const runtime = browser().runtime;

const backgroundPaths = [
    '/_generated_background_page.html',
];

export const getUrl = (path: string) => runtime.getURL(path);

export const getManifest = (): Manifest => runtime.getManifest();

export const getVersion = (): string => getManifest().version;

export const getId = (): string => runtime.id;

export const isBackground = (): boolean => {
    if (!getId()) {
        return false;
    }

    const manifest = getManifest();

    if (!manifest.background) {
        return false;
    }

    if (manifest.manifest_version === 3) {
        return _isUndefined(window);
    }

    return !_isUndefined(window) && backgroundPaths.includes(location.pathname);
}