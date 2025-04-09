import {StorageState} from '@typing/storage'

import BaseStorage, {BaseStorageOptions} from "./BaseStorage";

export interface StorageOptions extends BaseStorageOptions {}

export class Storage<T extends StorageState> extends BaseStorage<T> {
    static Sync<T extends StorageState>(namespace?: string): Storage<T> {
        return new Storage<T>({ area: 'sync', namespace });
    }

    static Local<T extends StorageState>(namespace?: string): Storage<T> {
        return new Storage<T>({ area: 'local', namespace });
    }

    static Session<T extends StorageState>(namespace?: string): Storage<T> {
        return new Storage<T>({ area: 'session', namespace });
    }

    static Managed<T extends StorageState>(namespace?: string): Storage<T> {
        return new Storage<T>({ area: 'managed', namespace });
    }

    constructor(options: StorageOptions = {}) {
        super(options)
    }
}
