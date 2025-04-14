import 'jest-webextension-mock';

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