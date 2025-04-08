import BaseStorage, {BaseStorageOptions} from "./BaseStorage";

export interface StorageOptions extends BaseStorageOptions {}

export class Storage extends BaseStorage {
    static Sync = (namespace?: string) => new this({area: 'sync', namespace});
    static Local = (namespace?: string) => new this({area: 'local', namespace});
    static Session = (namespace?: string) => new this({area: 'session', namespace});
    static Managed = (namespace?: string) => new this({area: 'managed', namespace});

    constructor(options: StorageOptions = {}) {
        super(options)
    }
}
