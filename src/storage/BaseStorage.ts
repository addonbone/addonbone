import {browser} from '@browser/env'
import {throwRuntimeError} from '@browser/runtime'
import {StorageProvider, StorageState, WatchOptions} from '@typing/storage'

const storage = browser().storage;

type StorageArea = chrome.storage.StorageArea;
type StorageChange = chrome.storage.StorageChange;
type StorageAreaName = Parameters<Parameters<typeof chrome.storage.onChanged.addListener>[0]>[1];

export interface BaseStorageOptions {
    area?: StorageAreaName,
    namespace?: string,
}

abstract class BaseStorage<T extends StorageState> implements StorageProvider<T> {
    private storage: StorageArea;
    private readonly namespace: string;

    protected constructor({area = "local", namespace = ""}: BaseStorageOptions = {}) {
        this.storage = storage[area];
        this.namespace = namespace?.trim();
    }

    public async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
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

    public async get<K extends keyof T>(key: K): Promise<T[K] | undefined> {
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

    public async getAll<P extends T>(): Promise<P> {
        return new Promise((resolve, reject) => {
            this.storage.get(null, (result) => {
                try {
                    throwRuntimeError()
                    resolve(result as P);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }


    public async remove<K extends keyof T>(key: K): Promise<void> {
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

    public watch<P extends T>(options: WatchOptions<P>): () => void {
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

    private getFullKey(key: keyof T): string {
        return this.namespace ? `${this.namespace}:${key.toString()}` : key.toString();
    }
}

export default BaseStorage
