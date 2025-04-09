import {StorageState, StorageWatchOptions} from "@typing/storage";
import BaseStorage, {BaseStorageOptions} from "./BaseStorage";

type StorageChange = chrome.storage.StorageChange;

export interface SecureStorageOptions extends BaseStorageOptions {
    secureKey?: string;
}

export class SecureStorage<T extends StorageState> extends BaseStorage<T> {
    private cryptoKey: CryptoKey | null = null;
    private secureKey: string = 'SecureKey';

    static Sync<T extends StorageState>(options: Omit<SecureStorageOptions, 'area'>): SecureStorage<T> {
        return new SecureStorage<T>({area: 'sync', ...options});
    }

    static Local<T extends StorageState>(options: Omit<SecureStorageOptions, 'area'>): SecureStorage<T> {
        return new SecureStorage<T>({area: 'local', ...options});
    }

    static Session<T extends StorageState>(options: Omit<SecureStorageOptions, 'area'>): SecureStorage<T> {
        return new SecureStorage<T>({area: 'session', ...options});
    }

    static Managed<T extends StorageState>(options: Omit<SecureStorageOptions, 'area'>): SecureStorage<T> {
        return new SecureStorage<T>({area: 'managed', ...options});
    }

    constructor({secureKey, ...options}: SecureStorageOptions) {
        super(options)
        secureKey && this.setSecureKey(secureKey)
    }

    private setSecureKey = (secureKey: string) => {
        this.cryptoKey = null;
        this.secureKey = secureKey;
    }

    private async generateCryptoKey(): Promise<CryptoKey> {
        if (this.cryptoKey) return this.cryptoKey;

        const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(this.secureKey));
        const key = await crypto.subtle.importKey(
            "raw",
            hash.slice(0, 32),
            {name: "AES-GCM"},
            false,
            ["encrypt", "decrypt"]
        );
        this.cryptoKey = key;
        return key;
    }

    private async encrypt(data: any): Promise<string> {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(JSON.stringify(data));
        const cryptoKey = await this.generateCryptoKey();
        const cipher = await crypto.subtle.encrypt(
            {name: "AES-GCM", iv},
            cryptoKey,
            encoded
        );
        return `${btoa(String.fromCharCode(...new Uint8Array(iv)))}:${btoa(String.fromCharCode(...new Uint8Array(cipher)))}`;
    }

    private async decrypt(data: string): Promise<any> {
        const [ivStr, cipherStr] = data.split(":");
        const iv = new Uint8Array(atob(ivStr).split("").map(c => c.charCodeAt(0)));
        const cipher = new Uint8Array(atob(cipherStr).split("").map(c => c.charCodeAt(0)));
        const cryptoKey = await this.generateCryptoKey();
        const decrypted = await crypto.subtle.decrypt(
            {name: "AES-GCM", iv},
            cryptoKey,
            cipher
        );
        return JSON.parse(new TextDecoder().decode(decrypted));
    }

    async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
        const encryptedValue = await this.encrypt(value);
        return super.set(key, encryptedValue as T[K]);
    }

    async get<K extends keyof T>(key: K): Promise<T[K] | undefined> {
        const encryptedValue = await super.get(key) as string;
        return encryptedValue ? this.decrypt(encryptedValue) : undefined;
    }

    protected async handleStorageChange<P extends T>(key: string, changes: StorageChange, options: StorageWatchOptions<P>) {
        if (!this.isSecuredKey(key)) return;
        const newValue = changes.newValue !== undefined ? await this.decrypt(changes.newValue) : undefined;
        const oldValue = changes.oldValue !== undefined ? await this.decrypt(changes.oldValue) : undefined;
        await this.notifyChangeListeners(key, {newValue, oldValue}, options)
    };

    protected getFullKey(key: keyof T): string {
        if (this.namespace) {
            return `secure${this.separator}${this.namespace}${this.separator}${key.toString()}`;
        }
        return `secure${this.separator}${key.toString()}`;
    }
}
