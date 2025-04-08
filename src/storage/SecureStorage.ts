import BaseStorage, {BaseStorageOptions} from "./BaseStorage";

export interface SecureStorageOptions extends BaseStorageOptions {
    secureKey?: string;
}

export class SecureStorage extends BaseStorage {
    private cryptoKey: CryptoKey | null = null;
    private secureKey: string = 'SecureKey';

    static Sync = (namespace?: string, secureKey?: string) => new this({area: 'sync', namespace, secureKey});
    static Local = (namespace?: string, secureKey?: string) => new this({area: 'local', namespace, secureKey});
    static Session = (namespace?: string, secureKey?: string) => new this({area: 'session', namespace, secureKey});
    static Managed = (namespace?: string, secureKey?: string) => new this({area: 'managed', namespace, secureKey});

    constructor({secureKey, ...options}: SecureStorageOptions) {
        super(options)
        secureKey && this.setSecureKey(secureKey)
    }

    private setSecureKey = (secureKey: string) => {
        this.cryptoKey = null;
        this.secureKey = secureKey;
    }

    private async generateCryptoKey(): Promise<CryptoKey> {
        if(this.cryptoKey) return this.cryptoKey;

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

    async set<T>(key: string, value: T): Promise<void> {
        const encryptedValue = await this.encrypt(value);
        return super.set(key, encryptedValue);
    }

    async get<T>(key: string): Promise<T | undefined> {
        const encryptedValue = await super.get<string>(key);
        return encryptedValue ? this.decrypt(encryptedValue) : undefined;
    }
}
