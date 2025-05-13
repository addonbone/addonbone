import {browser} from "./browser";
import {throwRuntimeError} from "./runtime";

type DataTypeSet = chrome.browsingData.DataTypeSet
type RemovalOptions = chrome.browsingData.RemovalOptions
type SettingsResult = chrome.browsingData.SettingsResult

const browsingData = () => browser().browsingData as typeof chrome.browsingData

// Methods
export const removeBrowsingData = (options: RemovalOptions, dataToRemove: DataTypeSet): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().remove(options, dataToRemove, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeAppcacheData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeAppcache(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeCacheData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeCache(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeCacheStorageData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeCacheStorage(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeCookiesData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeCookies(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeDownloadsData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeDownloads(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeFileSystemsData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeFileSystems(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeFormDataData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeFormData(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeHistoryData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeHistory(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeIndexedDBData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeIndexedDB(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeLocalStorageData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeLocalStorage(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removePasswordsData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removePasswords(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeServiceWorkersData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeServiceWorkers(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeWebSQLData = (options?: RemovalOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    browsingData().removeAppcache(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const getBrowsingDataSettings = (): Promise<SettingsResult> => new Promise<SettingsResult>((resolve, reject) => {
    browsingData().settings((result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});
