import SecureStorage from "./SecureStorage";

const namespace = "user";

const securedStorage = new SecureStorage();
const securedStorageWithNamespace = new SecureStorage({namespace});
const securedStorageWithSecureKey = new SecureStorage({secureKey: "customSecureKey"});

beforeEach(async () => {
    await chrome.storage.local.clear();
});

test("getAll method - returns all values from current namespace", async () => {
    await securedStorage.set("a", 1);
    await securedStorage.set("b", 2);
    await securedStorageWithNamespace.set("c", 3);
    await securedStorageWithNamespace.set("d", 4);

    const result = await securedStorage.getAll();
    const resultWithNamespace = await securedStorageWithNamespace.getAll();

    expect(result).toEqual({a: 1, b: 2});
    expect(resultWithNamespace).toEqual({c: 3, d: 4});
});

test("clear method - removes all keys from current namespace", async () => {
    await securedStorage.set("a", 1);
    await securedStorage.set("b", 2);
    await securedStorageWithNamespace.set("c", 3);
    await securedStorageWithNamespace.set("d", 4);

    await securedStorage.clear();

    const result = await securedStorage.getAll();
    const resultWithNamespace = await securedStorageWithNamespace.getAll();

    expect(result).toEqual({});
    expect(resultWithNamespace).toEqual({c: 3, d: 4});
});

describe("set/get methods with different type of value", () => {
    test.each([
        ["string", "hello"],
        ["number", 42],
        ["boolean", true],
        ["null", null],
        ["undefined", undefined],
        ["object", {a: 1, b: true}],
        ["array", [1, 2, 3]],
    ])("set/get with %s", async (_, value) => {
        await securedStorage.set("key", value);

        const encryptedValue = await global.storageLocalGet("key", securedStorage);
        const decryptedValue = (await securedStorage.getAll())["key"];

        value !== undefined && expect(encryptedValue).not.toEqual(value);
        expect(decryptedValue).toEqual(value);
    });
});

describe("set method", () => {
    test("saves secured data with namespace", async () => {
        await securedStorageWithNamespace.set("theme", "dark");

        const encryptedValue = await global.storageLocalGet("theme", securedStorageWithNamespace);
        const decryptedValue = (await securedStorageWithNamespace.getAll())["theme"];

        expect(encryptedValue).not.toEqual("dark");
        expect(decryptedValue).toEqual("dark");
    });

    test('added "secure:" prefix to keys', async () => {
        await securedStorage.set("theme", "dark");
        await securedStorageWithNamespace.set("volume", 100);

        const allFullKeys = Object.keys(await chrome.storage.local.get(null));

        expect(allFullKeys.length).toBeGreaterThan(0);

        allFullKeys.forEach(key => expect(key.startsWith("secure:")).toBe(true));
    });

    test("saves the same data with different secureKey in different encrypted format", async () => {
        await securedStorageWithNamespace.set("theme", "dark");
        await securedStorageWithSecureKey.set("theme", "dark");

        const firstEncryptedValue = await global.storageLocalGet("theme", securedStorageWithNamespace);
        const secondEncryptedValue = await global.storageLocalGet("theme", securedStorageWithSecureKey);

        const firstDecryptedValue = (await securedStorageWithNamespace.getAll())["theme"];
        const secondDecryptedValue = (await securedStorageWithSecureKey.getAll())["theme"];

        expect(firstEncryptedValue).not.toBe(secondEncryptedValue);
        expect(firstDecryptedValue).toBe(secondDecryptedValue);
    });
});

describe("remove method", () => {
    test("deletes the key without namespace", async () => {
        await securedStorage.set("theme", "dark");
        await securedStorage.remove("theme");
        const result = (await securedStorage.getAll())["theme"];
        expect(result).toBeUndefined();
    });

    test("deletes the key with namespace", async () => {
        await securedStorageWithNamespace.set("theme", "dark");
        await securedStorageWithNamespace.remove("theme");
        const result = (await securedStorageWithNamespace.getAll())["theme"];
        expect(result).toBeUndefined();
    });
});

describe("watch method", () => {
    test("calls specific key callback on change", async () => {
        const keyCallback = jest.fn();

        securedStorage.watch({theme: keyCallback});

        await global.simulateSecureStorageChange({
            storage: securedStorage,
            key: "theme",
            oldValue: "light",
            newValue: "dark",
        });

        expect(keyCallback).toHaveBeenCalledWith("dark", "light");
    });

    test("does not call key callback for unrelated key", async () => {
        const keyCallback = jest.fn();

        securedStorage.watch({theme: keyCallback});

        await global.simulateSecureStorageChange({
            storage: securedStorage,
            key: "volume",
            oldValue: 50,
            newValue: 80,
        });

        expect(keyCallback).not.toHaveBeenCalled();
    });

    test("calls global callback on any change", async () => {
        const globalCallback = jest.fn();
        securedStorage.watch(globalCallback);

        await global.simulateSecureStorageChange({
            storage: securedStorage,
            key: "theme",
            oldValue: "light",
            newValue: "dark",
        });
        await global.simulateSecureStorageChange({
            storage: securedStorage,
            key: "volume",
            oldValue: 50,
            newValue: 80,
        });

        expect(globalCallback).toHaveBeenCalledWith(80, 50);
        expect(globalCallback).toHaveBeenCalledWith("dark", "light");
    });

    test("calls both key and global callbacks", async () => {
        const keyCallback = jest.fn();
        const globalCallback = jest.fn();
        securedStorage.watch({theme: keyCallback});
        securedStorage.watch(globalCallback);

        await global.simulateSecureStorageChange({
            storage: securedStorage,
            key: "theme",
            oldValue: "light",
            newValue: "dark",
        });
        await global.simulateSecureStorageChange({
            storage: securedStorage,
            key: "volume",
            oldValue: 50,
            newValue: 80,
        });

        expect(keyCallback).toHaveBeenCalledWith("dark", "light");
        expect(globalCallback).toHaveBeenCalledWith(80, 50);
        expect(globalCallback).toHaveBeenCalledWith("dark", "light");
    });
});
