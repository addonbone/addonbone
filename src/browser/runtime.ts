import {browser} from "./env";
import {ManifestVersion} from "@typing/manifest";

type Manifest = chrome.runtime.Manifest;
type PlatformInfo = chrome.runtime.PlatformInfo;
type ContextFilter = chrome.runtime.ContextFilter;
type ExtensionContext = chrome.runtime.ExtensionContext;

const runtime = browser().runtime;

const backgroundPaths = [
    '/_generated_background_page.html',
];

export const getRuntimeId = (): string => runtime.id;

export const getRuntimeUrl = (path: string) => runtime.getURL(path);

export const getRuntimeManifest = (): Manifest => runtime.getManifest();

export const getRuntimeManifestVersion = (): ManifestVersion => getRuntimeManifest().manifest_version;

export const getRuntimeContexts = (filter: ContextFilter) => new Promise<ExtensionContext[]>((resolve, reject) => {
    runtime.getContexts(filter, contexts => {
        try {
            throwRuntimeError();

            resolve(contexts);
        } catch (e) {
            reject(e);
        }
    });
});

export const getRuntimePlatformInfo = (): Promise<PlatformInfo> => new Promise<PlatformInfo>((resolve, reject) => {
    runtime.getPlatformInfo((platformInfo) => {
        try {
            throwRuntimeError();

            resolve(platformInfo);
        } catch (e) {
            reject(e);
        }
    });
});

export const isManifestVersion3 = (): boolean => getRuntimeManifestVersion() === 3;

export const isBackground = (): boolean => {
    if (!getRuntimeId()) {
        return false;
    }

    const manifest = getRuntimeManifest();

    if (!manifest.background) {
        return false;
    }

    if (manifest.manifest_version === 3) {
        return typeof window === "undefined";
    }

    return window !== undefined && backgroundPaths.includes(location.pathname);
}

export const throwRuntimeError = (): void => {
    const error = runtime.lastError;

    if (error) {
        throw new Error(error.message);
    }
}

export const onRuntimeInstalled = (callback: Parameters<typeof runtime.onInstalled.addListener>[0]) => {
    runtime.onInstalled.addListener(callback);

    return () => runtime.onInstalled.removeListener(callback);
}
