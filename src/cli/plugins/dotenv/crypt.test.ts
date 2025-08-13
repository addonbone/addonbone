import {decryptData, encryptData} from "./crypt";

// Helper to ensure global atob/btoa exist in test environment (jsdom usually provides these)
// but just in case, provide minimal fallbacks using Buffer without external deps.
if (typeof (globalThis as any).atob !== "function") {
    (globalThis as any).atob = (input: string) => Buffer.from(input, "base64").toString("binary");
}

if (typeof (globalThis as any).btoa !== "function") {
    (globalThis as any).btoa = (input: string) => Buffer.from(input, "binary").toString("base64");
}

describe("dotenv crypt - encryptData/decryptData", () => {
    const sample = {foo: "bar", count: 42, flag: true, nested: {a: 1}};
    const key = "simple-key-123"; // simple string key, no external deps

    test("encrypt/decrypt roundtrip with explicit key", () => {
        const encrypted = encryptData(sample, key);
        expect(typeof encrypted).toBe("string");
        expect(encrypted).not.toEqual(JSON.stringify(sample));

        const decrypted = decryptData<typeof sample>(encrypted, key);
        expect(decrypted).toEqual(sample);
    });

    test("deterministic encryption with same key and data", () => {
        const e1 = encryptData(sample, key);
        const e2 = encryptData(sample, key);
        expect(e1).toBe(e2);
    });

    test("decrypt without key throws helpful error", () => {
        const encrypted = encryptData(sample, key);
        expect(() => decryptData(encrypted)).toThrow(
            'You need to specify the "key" argument for the decryptData function.'
        );
    });

    test("decrypt with wrong key fails (invalid JSON)", () => {
        const encrypted = encryptData(sample, key);
        expect(() => decryptData(encrypted, "wrong-key")).toThrow();
    });
});
