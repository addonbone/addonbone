import {SecureStorageOptions,} from '@typing/storage'
import BaseStorage from "./BaseStorage";

export class SecureStorage extends BaseStorage {
    private cryptoKey!: CryptoKey;

    static Sync = (secureKey: string, namespace?: string) => new this({area: 'sync', namespace, secureKey});
    static Local = (secureKey: string, namespace?: string) => new this({area: 'local', namespace, secureKey});
    static Session = (secureKey: string, namespace?: string) => new this({area: 'session', namespace, secureKey});
    static Managed = (secureKey: string, namespace?: string) => new this({area: 'managed', namespace, secureKey});

    constructor({secureKey, ...options}: SecureStorageOptions) {
        super(options)
        this.generateCryptoKey(secureKey)
            .then(cryptoKey => this.cryptoKey = cryptoKey)
            .catch(() => {})
    }

    private async generateCryptoKey(key: string): Promise<CryptoKey> {
        const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
        return await crypto.subtle.importKey(
            "raw",
            hash.slice(0, 32),
            {name: "AES-GCM"},
            false,
            ["encrypt", "decrypt"]
        );
    }

    private async encrypt(data: any): Promise<string> {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(JSON.stringify(data));
        const cipher = await crypto.subtle.encrypt(
            {name: "AES-GCM", iv},
            this.cryptoKey,
            encoded
        );
        return `${btoa(String.fromCharCode(...new Uint8Array(iv)))}:${btoa(String.fromCharCode(...new Uint8Array(cipher)))}`;
    }

    private async decrypt(data: string): Promise<any> {
        const [ivStr, cipherStr] = data.split(":");
        const iv = new Uint8Array(atob(ivStr).split("").map(c => c.charCodeAt(0)));
        const cipher = new Uint8Array(atob(cipherStr).split("").map(c => c.charCodeAt(0)));
        const decrypted = await crypto.subtle.decrypt(
            {name: "AES-GCM", iv},
            this.cryptoKey,
            cipher
        );
        return JSON.parse(new TextDecoder().decode(decrypted));
    }

    async set<T>(key: string, value: T): Promise<void> {
        const encryptedValue = await this.encrypt(value);
        return super.set(key, encryptedValue);
    }

    async get<T>(key: string): Promise<T | undefined> {
        const encryptedValue = await super.get<string>(key);
        return encryptedValue ? this.decrypt(encryptedValue) : undefined;
    }
}
