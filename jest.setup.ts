import 'jest-webextension-mock';

const listeners: Array<
    (changes: {[p: string]: chrome.storage.StorageChange}, areaName: chrome.storage.AreaName) => void
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

global.simulateStorageChange = (
    changes: {[p: string]: chrome.storage.StorageChange},
    areaName: chrome.storage.AreaName = 'local'
) => {
    for (const listener of listeners) {
        listener(changes, areaName);
    }
};

global.storageLocalGet = (key: string | string[]): Promise<any> => {
    return new Promise(resolve => {
        chrome.storage.local.get(key, (res) => {
            resolve(
                Array.isArray(key)
                    ? key.reduce((acc, k) => ({ ...acc, [k]: res[k] }), {})
                    : res[key]
            );
        });
    });
};