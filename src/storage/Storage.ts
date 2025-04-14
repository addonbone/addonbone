import {StorageState, StorageWatchOptions} from '@typing/storage'

import BaseStorage, {BaseStorageOptions} from "./BaseStorage";

type StorageChange = chrome.storage.StorageChange;

export interface StorageOptions extends BaseStorageOptions {
}

export class Storage<T extends StorageState> extends BaseStorage<T> {
    static Sync<T extends StorageState>(namespace?: string): Storage<T> {
        return new Storage<T>({area: 'sync', namespace});
    }

    static Local<T extends StorageState>(namespace?: string): Storage<T> {
        return new Storage<T>({area: 'local', namespace});
    }

    static Session<T extends StorageState>(namespace?: string): Storage<T> {
        return new Storage<T>({area: 'session', namespace});
    }

    static Managed<T extends StorageState>(namespace?: string): Storage<T> {
        return new Storage<T>({area: 'managed', namespace});
    }

    constructor(options: StorageOptions = {}) {
        super(options)
    }

    public async clear(): Promise<void> {
        const allValues = await this.getAll();

        await Promise.all(Object.keys(allValues).map(key => this.remove(key)));
    }

    protected canChange(key: string): boolean {
        if (!super.canChange(key)) return false;

        const parts = key.split(this.separator);

        return (parts.length === 1 || (parts.length === 2 && parts[0] === this.namespace))
    }

    protected async handleChange<P extends T>(key: string, changes: StorageChange, options: StorageWatchOptions<P>) {
        await this.triggerChange(key, changes, options)
    };

    protected getFullKey(key: keyof T): string {
        return this.namespace ? `${this.namespace}${this.separator}${key.toString()}` : key.toString();
    }

    protected getNamespaceOfKey(key: string): string | undefined {
        const fullKeyParts = key.split(this.separator);
        return fullKeyParts.length === 2 ? fullKeyParts[0] : undefined;
    }
}
