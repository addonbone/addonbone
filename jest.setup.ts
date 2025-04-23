import 'jest-webextension-mock';
import AbstractStorage from './src/storage/providers/AbstractStorage'
import {TextDecoder, TextEncoder} from 'util';

const listeners: Array<
    (changes: { [p: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void
> = [];

chrome.storage.onChanged.addListener = (fn) => {
    listeners.push(fn);
};

chrome.storage.onChanged.removeListener = (fn) => {
    const index = listeners.indexOf(fn);
    if (index > -1) {
        listeners.splice(index, 1);
    }
};

chrome.storage.onChanged.hasListener = (fn) => {
    return listeners.includes(fn);
};

interface StorageChange {
    storage: AbstractStorage<any>,
    key: string,
    oldValue: any,
    newValue: any,
    areaName: chrome.storage.AreaName
}

global.simulateStorageChange = ({storage, key, oldValue, newValue, areaName = 'local'}: StorageChange) => {
    const fullKey = storage['getFullKey'](key);

    const changes = {[fullKey]: {oldValue, newValue}}

    listeners.forEach((listener) => listener(changes, areaName))
}

global.simulateSecureStorageChange = async ({storage, key, oldValue, newValue, areaName}: StorageChange) => {
    const encryptedOldValue = oldValue !== undefined ? await storage['encrypt'](oldValue) : undefined;
    const encryptedNewValue = newValue !== undefined ? await storage['encrypt'](newValue) : undefined;

    global.simulateStorageChange({storage, key, oldValue: encryptedOldValue, newValue: encryptedNewValue, areaName});

    await new Promise(resolve => setTimeout(resolve));
};

// Needed to access a specific key in Storage
// Native GET method does not work correctly with a specific key other than "key"
// Pull Request with bug fix - https://github.com/RickyMarou/jest-webextension-mock/pull/19
global.storageLocalGet = (key: string | string[], storage: AbstractStorage<any>): Promise<any> => {
    const formatKey = (key: string) => storage ? storage['getFullKey'](key) : key;
    return new Promise(resolve => {
        chrome.storage.local.get(null, (res) => {
            resolve(
                Array.isArray(key)
                    ? key.reduce((acc, k) => ({...acc, [formatKey(k)]: res[formatKey(k)]}), {})
                    : res[formatKey(key)]
            );
        });
    });
};

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

export const cryptoMock = {
    subtle: {
        importKey: jest.fn(),
        deriveKey: jest.fn(),
        decrypt: jest.fn(),
        encrypt: jest.fn(),
        digest: jest.fn()
    },
    getRandomValues: jest.fn()
}

cryptoMock.subtle.importKey.mockImplementation(
    (format, keyData, algorithm, extractable, keyUsages) => {
        return Promise.resolve({
            format,
            keyData,
            algorithm,
            extractable,
            keyUsages
        })
    }
)

cryptoMock.subtle.deriveKey.mockImplementation(
    (algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages) => {
        return Promise.resolve({
            algorithm,
            baseKey,
            derivedKeyAlgorithm,
            extractable,
            keyUsages
        })
    }
)

// @ts-ignore
cryptoMock.subtle.decrypt.mockImplementation((_, __, data: ArrayBufferLike) => {
    return Promise.resolve(new Uint8Array(data))
})

// @ts-ignore
cryptoMock.subtle.encrypt.mockImplementation((_, __, data: ArrayBufferLike) => {
    return Promise.resolve(new Uint8Array(data))
})

// @ts-ignore
cryptoMock.subtle.digest.mockImplementation((_, __) => {
    return Promise.resolve(new Uint8Array([0x01, 0x02, 0x03, 0x04]))
})

// @ts-ignore
cryptoMock.getRandomValues.mockImplementation((array: Array<any>) => {
    for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
    }
    return array
})

// The globalThis does not define crypto by default
Object.defineProperty(globalThis, "crypto", {
    value: cryptoMock,
    writable: true,
    enumerable: true,
    configurable: true
})
