import {browser} from '@browser/env'
import {throwRuntimeError} from '@browser/runtime'
import {StorageProvider, StorageState, StorageWatchOptions} from '@typing/storage'

const storage = browser().storage;

type AreaName = chrome.storage.AreaName
type StorageArea = chrome.storage.StorageArea;
type StorageChange = chrome.storage.StorageChange;
type onChangedListener = Parameters<typeof chrome.storage.onChanged.addListener>[0];

export interface BaseStorageOptions {
    area?: AreaName,
    namespace?: string,
}

abstract class BaseStorage<T extends StorageState> implements StorageProvider<T> {
    private storage: StorageArea;
    private readonly area: AreaName;
    protected readonly namespace: string;
    protected separator: string = ':';

    protected constructor({area = "local", namespace = ""}: BaseStorageOptions = {}) {
        this.area = area;
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

    public watch<P extends T>(options: StorageWatchOptions<P>): () => void {
        const listener: onChangedListener = (changes: Record<string, StorageChange>, area: AreaName) => {
            if (area !== this.area) return;

            Object.entries(changes).forEach(async ([key, change]) => {
                if (this.getNamespaceOfKey(key) !== this.namespace) return;
                await this.handleStorageChange(key, change, options);
            });
        };

        chrome.storage.onChanged.addListener(listener);

        return () => chrome.storage.onChanged.removeListener(listener);
    };

    protected async handleStorageChange<P extends T>(key: string, changes: StorageChange, options: StorageWatchOptions<P>) {
        if (this.isSecuredKey(key)) return;
        await this.notifyChangeListeners(key, changes, options)
    };

    protected async notifyChangeListeners<P extends T>(key: string, changes: StorageChange, options: StorageWatchOptions<P>) {
        const {newValue, oldValue} = changes;
        const originalKey = this.getOriginalKey(key)

        if (typeof options === "function") {
            options(newValue, oldValue);
        } else if (options[originalKey]) {
            options[originalKey]?.(newValue, oldValue);
        }
    };

    protected getFullKey(key: keyof T): string {
        return this.namespace ? `${this.namespace}${this.separator}${key.toString()}` : key.toString();
    }

    protected getOriginalKey(key: string): keyof T {
        const fullKeyParts = key.split(this.separator);
        return fullKeyParts.length > 1 ? fullKeyParts[fullKeyParts.length - 1] : key;
    }

    protected getNamespaceOfKey(key: string): string {
        const fullKeyParts = key.split(this.separator);
        if (fullKeyParts.length === 2) return fullKeyParts[0];
        if (fullKeyParts.length === 3) return fullKeyParts[1];
        return ''
    }

    protected isSecuredKey(key: string): boolean {
        return key.includes('secure');
    }
}

export default BaseStorage
