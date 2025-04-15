import 'jest-webextension-mock';
import BaseStorage from './src/storage/BaseStorage'

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
    storage: BaseStorage<any>,
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

// Needed to access a specific key in Storage
// Native GET method does not work correctly with a specific key other than "key"
// Pull Request with bug fix - https://github.com/RickyMarou/jest-webextension-mock/pull/19
global.storageLocalGet = (key: string | string[], storage: BaseStorage<any>): Promise<any> => {
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