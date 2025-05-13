import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type ExtensionInfo = chrome.management.ExtensionInfo;

const management = () => browser().management as typeof chrome.management;

// Methods
export const createAppShortcut = async (id: string): Promise<void> => new Promise<void>((resolve, reject) => {
    management().createAppShortcut(id, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const generateAppForLink = async (url: string, title: string): Promise<ExtensionInfo> => new Promise<ExtensionInfo>((resolve, reject) => {
    management().generateAppForLink(url, title, (extensionInfo) => {
        try {
            throwRuntimeError();

            resolve(extensionInfo);
        } catch (e) {
            reject(e);
        }
    });
});

export const getExtensionInfo = async (id: string): Promise<ExtensionInfo> => new Promise<ExtensionInfo>((resolve, reject) => {
    management().get(id, (extensionInfo) => {
        try {
            throwRuntimeError();

            resolve(extensionInfo);
        } catch (e) {
            reject(e);
        }
    });
});

export const getAllExtensionInfo = async (): Promise<ExtensionInfo[]> => new Promise<ExtensionInfo[]>((resolve, reject) => {
    management().getAll((extensionsInfo) => {
        try {
            throwRuntimeError();

            resolve(extensionsInfo);
        } catch (e) {
            reject(e);
        }
    });
});

export const getPermissionWarningsById = async (id: string): Promise<string[]> => new Promise<string[]>((resolve, reject) => {
    management().getPermissionWarningsById(id, (permissionWarnings) => {
        try {
            throwRuntimeError();

            resolve(permissionWarnings);
        } catch (e) {
            reject(e);
        }
    });
});

export const getPermissionWarningsByManifest = async (manifestStr: string): Promise<string[]> => new Promise<string[]>((resolve, reject) => {
    management().getPermissionWarningsByManifest(manifestStr, (permissionWarnings) => {
        try {
            throwRuntimeError();

            resolve(permissionWarnings);
        } catch (e) {
            reject(e);
        }
    });
});

export const getCurrentExtension = async (): Promise<ExtensionInfo> => new Promise<ExtensionInfo>((resolve, reject) => {
    management().getSelf((extensionInfo) => {
        try {
            throwRuntimeError();

            resolve(extensionInfo);
        } catch (e) {
            reject(e);
        }
    });
});

export const launchExtensionApp = async (id: string): Promise<void> => new Promise<void>((resolve, reject) => {
    management().launchApp(id, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setExtensionEnabled = async (id: string, enabled: boolean): Promise<void> => new Promise<void>((resolve, reject) => {
    management().setEnabled(id, enabled, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setExtensionLaunchType = async (id: string, launchType: string): Promise<void> => new Promise<void>((resolve, reject) => {
    management().setLaunchType(id, launchType, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const uninstallExtension = async (id: string, showConfirmDialog?: boolean): Promise<void> => new Promise<void>((resolve, reject) => {
    management().uninstall(id, {showConfirmDialog}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const uninstallCurrentExtension = async (showConfirmDialog?: boolean): Promise<void> => new Promise<void>((resolve, reject) => {
    management().uninstallSelf({showConfirmDialog}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});


// Events
export const onExtensionDisabled = (callback: Parameters<typeof chrome.management.onDisabled.addListener>[0]): () => void => {
    return handleListener(management().onDisabled, callback)
}

export const onExtensionEnabled = (callback: Parameters<typeof chrome.management.onEnabled.addListener>[0]): () => void => {
    return handleListener(management().onEnabled, callback)
}

export const onExtensionInstalled = (callback: Parameters<typeof chrome.management.onInstalled.addListener>[0]): () => void => {
    return handleListener(management().onInstalled, callback)
}

export const onExtensionUninstalled = (callback: Parameters<typeof chrome.management.onUninstalled.addListener>[0]): () => void => {
    return handleListener(management().onUninstalled, callback)
}
