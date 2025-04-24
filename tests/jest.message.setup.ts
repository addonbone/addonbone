import 'jest-webextension-mock';
import {MessageSender} from "../src/types/message";

jest.mock('nanoid', () => ({nanoid: () => 'mocked-id'}));

let listener: ((...args: any[]) => boolean | void) | null = null;

chrome.runtime.onMessage.addListener = jest.fn((cb) => listener = cb);
chrome.runtime.onMessage.removeListener = jest.fn((cb) => listener === cb && (listener = null));
chrome.runtime.onMessage.hasListeners = jest.fn(() => !!listener);

(chrome.runtime.sendMessage as jest.Mock).mockImplementation((msg, callback) => {
    if (!listener) return;

    let called = false;
    const result = listener(msg, {} as MessageSender, (response: any) => {
        callback?.(response);
        called = true;
    });

    if (result === true) return;
    if (!called) callback?.(undefined);
});

(chrome.tabs.sendMessage as jest.Mock).mockImplementation((tabId, msg, options, callback) => {
    if (!listener) return;

    let called = false;
    const result = listener(msg, {} as MessageSender, (response: any) => {
        callback?.(response);
        called = true;
    });

    if (result === true) return;
    if (!called) callback?.(undefined);
});
