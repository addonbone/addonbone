import {throwRuntimeError} from '@browser/runtime'
import {BaseStorageOptions, StorageArea, StorageChange, WatchOptions} from '@typing/storage'

abstract class BaseStorage {
    private storage: StorageArea;
    private readonly namespace: string;

    protected constructor({area = "local", namespace = ""}: BaseStorageOptions = {}) {
        this.storage = chrome.storage[area];
        this.namespace = namespace?.trim();
    }

    async set<T>(key: string, value: T): Promise<void> {
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

    async get<T>(key: string): Promise<T | undefined> {
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

    async getAll(): Promise<Record<string, any>> {
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


    async remove(key: string): Promise<void> {
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

    async clear(): Promise<void> {
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

    watch(options: WatchOptions): () => void {
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

    private getFullKey = (key: string): string => this.namespace ? `${this.namespace}_${key}` : key;
}

export default BaseStorage
