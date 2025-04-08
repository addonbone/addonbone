export type WatchCallback = (newValue: any, oldValue: any) => void;
export type WatchOptions = Record<string, WatchCallback> | WatchCallback;

export interface StorageProvider {
    set<T>(key: string, value: T): Promise<void>;
    get<T>(key: string): Promise<T | undefined>;
    getAll(): Promise<Record<string, any>>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    watch(options: WatchOptions): () => void;
}