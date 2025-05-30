import {browser} from "./browser";
import {handleListener} from "./utils";

import {ManifestVersion} from "@typing/manifest";
import {MessageBody, MessageDictionary, MessageResponse, MessageType} from "@typing/message";

type Port = chrome.runtime.Port;
type Manifest = chrome.runtime.Manifest;
type PlatformInfo = chrome.runtime.PlatformInfo;
type ContextFilter = chrome.runtime.ContextFilter;
type ExtensionContext = chrome.runtime.ExtensionContext;
type RequestUpdateCheck = {
    status: chrome.runtime.RequestUpdateCheckStatus;
    details?: chrome.runtime.UpdateCheckDetails;
}

const runtime = () => browser().runtime as typeof chrome.runtime;

const backgroundPaths = ['/_generated_background_page.html'];


// Methods
export const connect = (extensionId: string, connectInfo?: object): Port => runtime().connect(extensionId, connectInfo);

export const connectNative = (application: string): Port => runtime().connectNative(application);

export const getContexts = (filter: ContextFilter): Promise<ExtensionContext[]> => new Promise<ExtensionContext[]>((resolve, reject) => {
    runtime().getContexts(filter, contexts => {
        try {
            throwRuntimeError();

            resolve(contexts);
        } catch (e) {
            reject(e);
        }
    });
});

export const getManifest = (): Manifest => runtime().getManifest();

export const getPackageDirectoryEntry = (): Promise<FileSystemDirectoryEntry> => new Promise<FileSystemDirectoryEntry>((resolve, reject) => {
    runtime().getPackageDirectoryEntry((directoryEntry) => {
        try {
            throwRuntimeError();

            resolve(directoryEntry);
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

export const getUrl = (path: string): string => runtime().getURL(path);

export const openOptionsPage = (): Promise<void> => new Promise<void>((resolve, reject) => {
    runtime().openOptionsPage(() => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const reload = (): void => runtime().reload();

export const requestUpdateCheck = (): Promise<RequestUpdateCheck> => new Promise<RequestUpdateCheck>((resolve, reject) => {
    runtime().requestUpdateCheck((status, details) => {
        try {
            throwRuntimeError();

            resolve({status, details});
        } catch (e) {
            reject(e);
        }
    });
});

export const restart = (): void => runtime().restart();

export const restartAfterDelay = (seconds: number): Promise<void> => new Promise<void>((resolve, reject) => {
    runtime().restartAfterDelay(seconds, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const sendMessage = <T extends MessageDictionary, K extends MessageType<T>>(message: MessageBody<T, K>): Promise<MessageResponse<T, K>> => new Promise<MessageResponse<T, K>>((resolve, reject) => {
    runtime().sendMessage(message, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});

export const setUninstallURL = (url: string): Promise<void> => new Promise<void>((resolve, reject) => {
    runtime().setUninstallURL(url, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});


// Custom Methods
export const getId = (): string => runtime().id;

export const getManifestVersion = (): ManifestVersion => getManifest().manifest_version;

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


// Events
export const onConnect = (callback: Parameters<typeof chrome.runtime.onConnect.addListener>[0]): () => void => {
    return handleListener(runtime().onConnect, callback)
}

export const onConnectExternal = (callback: Parameters<typeof chrome.runtime.onConnectExternal.addListener>[0]): () => void => {
    return handleListener(runtime().onConnectExternal, callback)
}

export const onInstalled = (callback: Parameters<typeof chrome.runtime.onInstalled.addListener>[0]): () => void => {
    return handleListener(runtime().onInstalled, callback)
}

export const onMessage = (callback: Parameters<typeof chrome.runtime.onMessage.addListener>[0]): () => void => {
    return handleListener(runtime().onMessage, callback)
}

export const onMessageExternal = (callback: Parameters<typeof chrome.runtime.onMessageExternal.addListener>[0]): () => void => {
    return handleListener(runtime().onMessageExternal, callback)
}

export const onRestartRequired = (callback: Parameters<typeof chrome.runtime.onRestartRequired.addListener>[0]): () => void => {
    return handleListener(runtime().onRestartRequired, callback)
}

export const onStartup = (callback: Parameters<typeof chrome.runtime.onStartup.addListener>[0]): () => void => {
    return handleListener(runtime().onStartup, callback)
}

export const onSuspend = (callback: Parameters<typeof chrome.runtime.onSuspend.addListener>[0]): () => void => {
    return handleListener(runtime().onSuspend, callback)
}

export const onSuspendCanceled = (callback: Parameters<typeof chrome.runtime.onSuspendCanceled.addListener>[0]): () => void => {
    return handleListener(runtime().onSuspendCanceled, callback)
}

export const onUpdateAvailable = (callback: Parameters<typeof chrome.runtime.onUpdateAvailable.addListener>[0]): () => void => {
    return handleListener(runtime().onUpdateAvailable, callback)
}

export const onUserScriptConnect = (callback: Parameters<typeof chrome.runtime.onUserScriptConnect.addListener>[0]): () => void => {
    return handleListener(runtime().onUserScriptConnect, callback)
}

export const onUserScriptMessage = (callback: Parameters<typeof chrome.runtime.onUserScriptMessage.addListener>[0]): () => void => {
    return handleListener(runtime().onUserScriptMessage, callback)
}
