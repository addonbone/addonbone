import AbstractStorage, {StorageOptions} from "./AbstractStorage";

import {StorageState, StorageWatchOptions} from "@typing/storage";

type StorageChange = chrome.storage.StorageChange;

export interface SecureStorageOptions extends StorageOptions {
    secureKey?: string;
}

export default class SecureStorage<T extends StorageState> extends AbstractStorage<T> {
    private readonly secureKey: string;

    private cryptoKey: CryptoKey | null = null;

    static Sync<T extends StorageState>(options: Omit<SecureStorageOptions, "area">): SecureStorage<T> {
        return new SecureStorage<T>({area: "sync", ...options});
    }

    static Local<T extends StorageState>(options: Omit<SecureStorageOptions, "area">): SecureStorage<T> {
        return new SecureStorage<T>({area: "local", ...options});
    }

    static Session<T extends StorageState>(options: Omit<SecureStorageOptions, "area">): SecureStorage<T> {
        return new SecureStorage<T>({area: "session", ...options});
    }

    static Managed<T extends StorageState>(options: Omit<SecureStorageOptions, "area">): SecureStorage<T> {
        return new SecureStorage<T>({area: "managed", ...options});
    }

    constructor({secureKey, ...options}: SecureStorageOptions = {}) {
        super(options);
        this.secureKey = secureKey?.trim() || "SecureKey";
    }

    private async generateCryptoKey(): Promise<CryptoKey> {
        if (this.cryptoKey) return this.cryptoKey;

        const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(this.secureKey));
        const key = await crypto.subtle.importKey("raw", hash.slice(0, 32), {name: "AES-GCM"}, false, [
            "encrypt",
            "decrypt",
        ]);
        this.cryptoKey = key;
        return key;
    }

    private async encrypt(data: any): Promise<string> {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(JSON.stringify(data));
        const cryptoKey = await this.generateCryptoKey();
        const cipher = await crypto.subtle.encrypt({name: "AES-GCM", iv}, cryptoKey, encoded);
        return `${btoa(String.fromCharCode(...new Uint8Array(iv)))}:${btoa(String.fromCharCode(...new Uint8Array(cipher)))}`;
    }

    private async decrypt(data: string): Promise<any> {
        const [ivStr, cipherStr] = data.split(":");
        const iv = new Uint8Array(
            atob(ivStr)
                .split("")
                .map(c => c.charCodeAt(0))
        );
        const cipher = new Uint8Array(
            atob(cipherStr)
                .split("")
                .map(c => c.charCodeAt(0))
        );
        const cryptoKey = await this.generateCryptoKey();
        const decrypted = await crypto.subtle.decrypt({name: "AES-GCM", iv}, cryptoKey, cipher);
        return JSON.parse(new TextDecoder().decode(decrypted));
    }

    public async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
        if (value === undefined) return;
        const encryptedValue = await this.encrypt(value);
        return super.set(key, encryptedValue as T[K]);
    }

    public async get<K extends keyof T>(key: K): Promise<T[K] | undefined> {
        const encryptedValue = (await super.get(key)) as string;
        return encryptedValue ? this.decrypt(encryptedValue) : undefined;
    }

    public async getAll<P extends T>(): Promise<P> {
        const encryptedValues = await super.getAll<P>();

        const decryptedValues: Partial<Record<keyof P, any>> = {};

        for (const [key, value] of Object.entries(encryptedValues)) {
            decryptedValues[key as keyof P] = value ? await this.decrypt(value.toString()) : undefined;
        }

        return decryptedValues as P;
    }

    public async clear(): Promise<void> {
        const allValues = await super.getAll();

        await this.remove(Object.keys(allValues));
    }

    protected isKeyValid(key: string): boolean {
        if (!super.isKeyValid(key)) return false;

        return key.startsWith(`secure${this.separator}`);
    }

    protected async handleChange<P extends T>(key: string, changes: StorageChange, options: StorageWatchOptions<P>) {
        const newValue = changes.newValue !== undefined ? await this.decrypt(changes.newValue) : undefined;
        const oldValue = changes.oldValue !== undefined ? await this.decrypt(changes.oldValue) : undefined;

        await this.triggerChange(key, {newValue, oldValue}, options);
    }

    protected getFullKey(key: keyof T): string {
        const parts: string[] = ["secure"];

        this.namespace && parts.push(this.namespace);

        return [...parts, key.toString()].join(this.separator);
    }

    protected getNamespaceOfKey(key: string): string | undefined {
        const fullKeyParts = key.split(this.separator);
        return fullKeyParts.length === 3 ? fullKeyParts[1] : undefined;
    }
}
