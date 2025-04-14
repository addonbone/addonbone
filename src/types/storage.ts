export type StorageState = Record<string, unknown>

export type StorageWatchOptions<T> = {
    [K in keyof T]?: (newValue: T[K] | undefined, oldValue: T[K] | undefined) => void;
} | ((newValue: Partial<T>, oldValue: Partial<T>) => void);


export interface StorageProvider<T extends StorageState> {
    set<K extends keyof T>(key: K, value: T[K]): Promise<void>;
    get<K extends keyof T>(key: K): Promise<T[K] | undefined>;
    getAll(): Promise<Partial<T>>;
    remove<K extends keyof T>(keys: K | K[]): Promise<void>;
    clear(): Promise<void>;
    watch(options: StorageWatchOptions<T>): () => void;
}