import 'jest-webextension-mock';
import {RelayGlobalKey} from "../src/types/relay";

chrome.scripting = {
    ...chrome.scripting,
    executeScript: jest.fn().mockImplementation(async ({args}) => {
        const [name, path, callArgs] = args;
        const relay = (globalThis as any)[RelayGlobalKey].get(name);
        const target = path?.split('.').reduce((acc: any, key: string) => acc?.[key], relay);
        const result = typeof target === 'function' ? await target(...callArgs) : target;
        return [{result}];
    })
};

jest.mock('@browser/scripting', () => ({
    __esModule: true,
    isAvailableScripting: jest.fn(),
    executeScript: jest.fn((injection) => {
        return new Promise((resolve, reject) => {
            chrome.scripting.executeScript(injection)
                .then(resolve)
                .catch(reject);
        });
    }),
}));
