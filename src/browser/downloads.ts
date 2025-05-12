import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

import {getBrowser} from "@main/env";

import {Browser} from "@typing/browser";

type DownloadItem = chrome.downloads.DownloadItem;
type DownloadQuery = chrome.downloads.DownloadQuery;
type DownloadState = chrome.downloads.DownloadState;
type DownloadOptions = chrome.downloads.DownloadOptions;
type GetFileIconOptions = chrome.downloads.GetFileIconOptions;

const downloads = () => browser().downloads as typeof chrome.downloads;

export class BlockDownloadError extends Error {
}

// Methods
export const acceptDownloadDanger = (downloadId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    downloads().acceptDanger(downloadId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const cancelDownload = (downloadId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    downloads().cancel(downloadId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const downloads = (options: DownloadOptions): Promise<number> => new Promise<number>((resolve, reject) => {
    downloads().download({conflictAction: 'uniquify', ...options}, (downloadId) => {
        try {
            throwRuntimeError();

            if (typeof downloadId !== "number") {
                throw new Error('Download id not created');
            }

            setTimeout(() => {
                findDownload(downloadId).then(item => {
                    if (!item) {
                        throw new BlockDownloadError('Download item not found after created');
                    }

                    const {error, state} = item;

                    if (state === "interrupted") {
                        if (error === "USER_CANCELED") {
                            throw new BlockDownloadError('Requires user permission to upload');
                        }

                        throw new Error(`Download error: ${error}`);
                    }

                    resolve(downloadId);
                }).catch(reject);
            }, 100);
        } catch (e) {
            reject(e);
        }
    });
});

export const eraseDownload = (query: DownloadQuery): Promise<number[]> => new Promise<number[]>((resolve, reject) => {
    downloads().erase(query, (erasedIds) => {
        try {
            throwRuntimeError();

            resolve(erasedIds);
        } catch (e) {
            reject(e);
        }
    });
});

export const getDownloadFileIcon = (downloadId: number, options: GetFileIconOptions): Promise<string> => new Promise<string>((resolve, reject) => {
    downloads().getFileIcon(downloadId, options, (iconURL) => {
        try {
            throwRuntimeError();

            resolve(iconURL);
        } catch (e) {
            reject(e);
        }
    });
});

export const openDownload = (downloadId: number): void => downloads().open(downloadId)

export const pauseDownload = (downloadId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    downloads().pause(downloadId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeDownloadFile = (downloadId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    downloads().removeFile(downloadId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const resumeDownload = (downloadId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    downloads().resume(downloadId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const searchDownloads = (query: DownloadQuery): Promise<DownloadItem[]> => new Promise<DownloadItem[]>((resolve, reject) => {
    downloads().search(query, (downloadItems) => {
        try {
            throwRuntimeError();

            resolve(downloadItems);
        } catch (e) {
            reject(e);
        }
    });
});

export const setDownloadsUiOptions = (enabled: boolean): Promise<void> => new Promise<void>((resolve, reject) => {
    downloads().setUiOptions({enabled}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const showDownloadFolder = (): void => downloads().showDefaultFolder();

export const showDownload = async (downloadId: number): Promise<boolean> => {
    if (!await isDownloadExists(downloadId)) {
        return false;
    }

    downloads().show(downloadId);

    return true;
}


// Custom Methods
export const findDownload = async (downloadId: number): Promise<DownloadItem | undefined> => {
    const items = await searchDownloads({id: downloadId});

    return items[0];
}

export const isDownloadExists = async (downloadId: number): Promise<boolean | undefined> => {
    const item = await findDownload(downloadId);

    return item?.exists;
}

export const getDownloadState = async (downloadId?: number): Promise<DownloadState | undefined> => {
    if (downloadId === undefined) {
        return;
    }

    const item = await findDownload(downloadId);

    return item?.state;
}

export const getSettingsDownloadsUrl = (): string => {
    switch (getBrowser()) {
        case Browser.Firefox:
            return "about:preferences#general";

        case Browser.Opera:
            return 'opera://settings/downloads';

        case Browser.Edge:
            return 'edge://settings/downloads';

        case Browser.Chrome:
        default:
            return 'chrome://settings/downloads';
    }
}


// Events
export const onDownloadsChanged = (callback: Parameters<typeof chrome.downloads.onChanged.addListener>[0]): () => void => {
    return handleListener(downloads().onChanged, callback)
}

export const onDownloadsCreated = (callback: Parameters<typeof chrome.downloads.onCreated.addListener>[0]): () => void => {
    return handleListener(downloads().onCreated, callback)
}

export const onDownloadsDeterminingFilename = (callback: Parameters<typeof chrome.downloads.onDeterminingFilename.addListener>[0]): () => void => {
    return handleListener(downloads().onDeterminingFilename, callback)
}
