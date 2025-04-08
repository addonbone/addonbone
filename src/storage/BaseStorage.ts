import {browser} from '@browser/env'
import {throwRuntimeError} from '@browser/runtime'
import {StorageProvider, WatchOptions} from '@typing/storage'

const storage = browser().storage;

type StorageArea = chrome.storage.StorageArea;
type StorageChange = chrome.storage.StorageChange;
type StorageAreaName = Parameters<Parameters<typeof chrome.storage.onChanged.addListener>[0]>[1];

export interface BaseStorageOptions {
    area?: StorageAreaName,
    namespace?: string,
}

abstract class BaseStorage implements StorageProvider {
    private storage: StorageArea;
    private readonly namespace: string;

    protected constructor({area = "local", namespace = ""}: BaseStorageOptions = {}) {
        this.storage = storage[area];
        this.namespace = namespace?.trim();
    }

    public async set<T>(key: string, value: T): Promise<void> {
        return new Promise((resolve, reject) => {
            this.storage.set({[this.getFullKey(key)]: value}, () => {
                try {
                    throwRuntimeError()
                    resolve();
                } catch (e) {
                    reject(e)
                }
            });
        });
    }

    public async get<T>(key: string): Promise<T | undefined> {
        const fullKey = this.getFullKey(key);
        return new Promise((resolve, reject) => {
            this.storage.get(fullKey, (result) => {
                try {
                    throwRuntimeError()
                    resolve(result[fullKey]);
                } catch (e) {
                    reject(e)
                }
            });
        });
    }

    public async getAll(): Promise<Record<string, any>> {
        return new Promise((resolve, reject) => {
            this.storage.get(null, (result) => {
                try {
                    throwRuntimeError()
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }


    public async remove(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.storage.remove(this.getFullKey(key), () => {
                try {
                    throwRuntimeError()
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    public async clear(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.storage.clear(() => {
                try {
                    throwRuntimeError()
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    public watch(options: WatchOptions): () => void {
        const listener = (changes: Record<string, StorageChange>) => {
            if (typeof options === 'function') {
                Object.values(changes).forEach((change) => {
                    options(change.newValue, change.oldValue);
                });
            } else {
                Object.entries(changes).forEach(([key, change]) => {
                    if (options[key]) {
                        options[key](change.newValue, change.oldValue);
                    }
                });
            }
        };

        chrome.storage.onChanged.addListener(listener);

        return () => chrome.storage.onChanged.removeListener(listener);
    };

    private getFullKey(key: string): string {
        return this.namespace ? `${this.namespace}:${key}` : key;
    }
}

export default BaseStorage
