import {Storage} from "./Storage";

describe('Storage: set, get, getAll, clear, remove, watch methods', () => {
    const namespace = 'user'
    const storage = new Storage();
    const storageWithNamespace = new Storage({namespace});

    beforeEach(async () => {
        await chrome.storage.local.clear();
    });

    test.each([
        ['string', 'hello'],
        ['number', 42],
        ['boolean', true],
        ['null', null],
        ['undefined', undefined],
        ['object', {a: 1, b: true}],
        ['array', [1, 2, 3]],
    ])('set/get - works with %s', async (_, value) => {
        await storage.set('key', value);
        const result = await storage.get('key');
        expect(result).toEqual(value);
    });

    test('set - saves data with namespace', async () => {
        await storageWithNamespace.set('theme', 'dark');
        const result = await global.storageLocalGet('theme', storageWithNamespace);
        const secondResult = (await storageWithNamespace.getAll())['theme'];

        expect(result).toEqual('dark');
        expect(secondResult).toEqual('dark');
    });

    test('getAll - returns only saved values', async () => {
        await storage.set('a', 1);
        await storage.set('b', 2);
        await storageWithNamespace.set('c', 3);
        await storageWithNamespace.set('d', 4);

        const result = await storage.getAll();
        const resultWithNamespace = await storageWithNamespace.getAll();

        expect(result).toEqual({a: 1, b: 2});
        expect(resultWithNamespace).toEqual({c: 3, d: 4});
    });

    test('remove - deletes the key', async () => {
        await storage.set('theme', 'dark');
        await storage.remove('theme');
        const result = (await storage.getAll())['theme'];
        expect(result).toBeUndefined();
    });

    test('remove - deletes the key with namespace', async () => {
        await storageWithNamespace.set('theme', 'dark');
        await storageWithNamespace.remove('theme');
        const result = (await storageWithNamespace.getAll())['theme'];
        expect(result).toBeUndefined();
    });

    test('clear - removes all keys from current namespace', async () => {
        await storage.set('a', 1);
        await storage.set('b', 2);
        await storageWithNamespace.set('c', 3);
        await storageWithNamespace.set('d', 4);

        await storage.clear();

        const result = await storage.getAll();
        const resultWithNamespace = await storageWithNamespace.getAll();

        expect(result).toEqual({});
        expect(resultWithNamespace).toEqual({c: 3, d: 4});
    });

    test('watch - calls specific key callback on change', () => {
        const keyCallback = jest.fn();
        storage.watch({theme: keyCallback});

        global.simulateStorageChange({storage, key: 'theme', oldValue: 'light', newValue: 'dark'});

        expect(keyCallback).toHaveBeenCalledWith('dark', 'light');
    });

    test('watch - does not call key callback for unrelated key', () => {
        const keyCallback = jest.fn();
        storage.watch({theme: keyCallback});

        global.simulateStorageChange({storage, key: 'volume', oldValue: 50, newValue: 80});

        expect(keyCallback).not.toHaveBeenCalled();
    });

    test('watch - calls global callback on any change', () => {
        const globalCallback = jest.fn();
        storage.watch(globalCallback);

        global.simulateStorageChange({storage, key: 'theme', oldValue: 'light', newValue: 'dark'});
        global.simulateStorageChange({storage, key: 'volume', oldValue: 50, newValue: 80});

        expect(globalCallback).toHaveBeenCalledWith(80, 50);
        expect(globalCallback).toHaveBeenCalledWith('dark', 'light');
    });

    test('watch - calls both key and global callbacks', () => {
        const keyCallback = jest.fn();
        const globalCallback = jest.fn();
        storage.watch({theme: keyCallback});
        storage.watch(globalCallback);

        global.simulateStorageChange({storage, key: 'theme', oldValue: 'light', newValue: 'dark'});
        global.simulateStorageChange({storage, key: 'volume', oldValue: 50, newValue: 80});

        expect(keyCallback).toHaveBeenCalledWith('dark', 'light');
        expect(globalCallback).toHaveBeenCalledWith(80, 50);
        expect(globalCallback).toHaveBeenCalledWith('dark', 'light');
    });
});
