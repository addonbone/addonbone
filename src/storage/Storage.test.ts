import { Storage } from "./Storage";

describe('Storage: basic operations', () => {
    const storage = new Storage();

    beforeEach(async () => {
        await chrome.storage.local.clear();
    });

    test.each([
        ['string', 'hello'],
        ['number', 42],
        ['boolean', true],
        ['null', null],
        ['object', { a: 1, b: true }],
        ['array', [1, 2, 3]],
    ])('set and get: %s', async (_, value) => {
        await storage.set('key', value);
        const result = await storage.get('key');
        expect(result).toEqual(value);
    });

    test('getAll returns only saved values', async () => {
        await storage.set('a', 1);
        await storage.set('b', 2);
        const result = await storage.getAll();
        expect(result).toEqual({ a: 1, b: 2 });
    });

    test('remove deletes the key', async () => {
        await storage.set('key', 1);
        await storage.remove('key');
        const result = await storage.get('key');
        expect(result).toBeUndefined();
    });

    test('clear removes all keys in namespace', async () => {
        const secondStorage = new Storage({namespace: 'test'});

        await storage.set('a', 1);
        await storage.set('b', 2);
        await secondStorage.set('c', 3);
        await secondStorage.set('d', 4);

        await storage.clear();

        const result = await storage.getAll();
        const secondResult = await secondStorage.getAll();

        expect(result).toEqual({});
        expect(secondResult).toEqual({ c: 3, d: 4 });
    });

});
