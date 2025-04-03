import {browser, getBrowser} from "./env";
import {throwRuntimeError} from "./runtime";

import {Browser} from "@typing/browser";

type DownloadItem = chrome.downloads.DownloadItem;
type DownloadQuery = chrome.downloads.DownloadQuery;
type DownloadState = chrome.downloads.DownloadState;
type DownloadOptions = chrome.downloads.DownloadOptions;

const downloads = browser().downloads;

export class BlockDownloadError extends Error {
}

export const download = (options: DownloadOptions): Promise<number> => new Promise<number>((resolve, reject) => {
    downloads.download({conflictAction: 'uniquify', ...options}, (downloadId) => {
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

export const cancelDownload = (downloadId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    downloads.cancel(downloadId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const queryDownloads = (query: DownloadQuery): Promise<DownloadItem[]> => new Promise<DownloadItem[]>((resolve, reject) => {
    downloads.search(query, (downloadItems) => {
        try {
            throwRuntimeError();

            resolve(downloadItems);
        } catch (e) {
            reject(e);
        }
    });
});

export const findDownload = async (downloadId: number): Promise<DownloadItem | undefined> => {
    const items = await queryDownloads({id: downloadId});

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

export const showDownload = async (downloadId: number): Promise<boolean> => {
    if (!await isDownloadExists(downloadId)) {
        return false;
    }

    downloads.show(downloadId);

    return true;
}

export const showDownloadFolder = (): void => downloads.showDefaultFolder();

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

export const onDownloadsCreated = (callback: Parameters<typeof chrome.downloads.onCreated.addListener>[0]) => {
    downloads.onCreated.addListener(callback);

    return () => downloads.onCreated.removeListener(callback);
}

export const onDownloadsChanged = (callback: Parameters<typeof chrome.downloads.onChanged.addListener>[0]) => {
    downloads.onChanged.addListener(callback);

    return () => downloads.onChanged.removeListener(callback);
}
