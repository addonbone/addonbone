export type StorageArea = chrome.storage.StorageArea;
export type StorageChange = chrome.storage.StorageChange;

export type StorageWatchEventListener = Parameters<typeof chrome.storage.onChanged.addListener>[0];
export type StorageAreaName = Parameters<StorageWatchEventListener>[1];

export type WatchCallback = (newValue: any, oldValue: any) => void;
export type WatchOptions = Record<string, WatchCallback> | WatchCallback;

export interface BaseStorageOptions {
    area?: StorageAreaName,
    namespace?: string,
}

export interface StorageOptions extends BaseStorageOptions {}

export interface SecureStorageOptions extends BaseStorageOptions {
    secureKey: string;
}
