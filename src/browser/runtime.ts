import {browser} from "./browser";
import {ManifestVersion} from "@typing/manifest";
import {MessageBody, MessageDictionary, MessageResponse, MessageType} from "@typing/message";

type Manifest = chrome.runtime.Manifest;
type PlatformInfo = chrome.runtime.PlatformInfo;
type ContextFilter = chrome.runtime.ContextFilter;
type ExtensionContext = chrome.runtime.ExtensionContext;

const runtime = () => browser().runtime;

const backgroundPaths = [
    '/_generated_background_page.view',
];

export const getId = (): string => runtime().id;

export const getUrl = (path: string) => runtime().getURL(path);

export const getManifest = (): Manifest => runtime().getManifest();

export const getManifestVersion = (): ManifestVersion => getManifest().manifest_version;

export const getRuntimeContexts = (filter: ContextFilter) => new Promise<ExtensionContext[]>((resolve, reject) => {
    runtime().getContexts(filter, contexts => {
        try {
            throwRuntimeError();

            resolve(contexts);
        } catch (e) {
            reject(e);
        }
    });
});

export const getPlatformInfo = (): Promise<PlatformInfo> => new Promise<PlatformInfo>((resolve, reject) => {
    runtime().getPlatformInfo((platformInfo) => {
        try {
            throwRuntimeError();

            resolve(platformInfo);
        } catch (e) {
            reject(e);
        }
    });
});

export const isManifestVersion3 = (): boolean => getManifestVersion() === 3;

export const isBackground = (): boolean => {
    if (!getId()) {
        return false;
    }

    const manifest = getManifest();

    if (!manifest.background) {
        return false;
    }

    if (manifest.manifest_version === 3) {
        return typeof window === "undefined";
    }

    return window !== undefined && backgroundPaths.includes(location.pathname);
}

export const throwRuntimeError = (): void => {
    const error = runtime().lastError;

    if (error) {
        throw new Error(error.message);
    }
}

export const sendMessage = <
    T extends MessageDictionary,
    K extends MessageType<T>
>(
    message: MessageBody<T, K>
): Promise<MessageResponse<T, K>> => new Promise<MessageResponse<T, K>>((resolve, reject) => {
    runtime().sendMessage(message, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});

export const onRuntimeInstalled = (callback: Parameters<typeof chrome.runtime.onInstalled.addListener>[0]): () => void => {
    runtime().onInstalled.addListener(callback);

    return () => runtime().onInstalled.removeListener(callback);
}

export const onMessage = (callback: Parameters<typeof chrome.runtime.onMessage.addListener>[0]): () => void => {
    runtime().onMessage.addListener(callback);

    return () => runtime().onMessage.removeListener(callback);
}
