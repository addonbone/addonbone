import Message from "./Message";
import {MessageSender} from "../types/message";

jest.mock('nanoid', () => ({nanoid: () => 'mocked-id'}));

let listeners: any[] = [];
chrome.runtime.onMessage.addListener = jest.fn((cb) => listeners.push(cb));
chrome.runtime.onMessage.removeListener = jest.fn((cb) => {
    const index = listeners.indexOf(cb);
    if (index >= 0) listeners.splice(index, 1);
});

(chrome.runtime.sendMessage as jest.Mock).mockImplementation((msg, callback) => {
    for (const listener of listeners) {
        const handled = listener(msg, {} as MessageSender, (res: any) => callback?.(res));
        if (handled) break;
    }
});

(chrome.tabs.sendMessage as jest.Mock).mockImplementation((tabId, msg, options, callback) => {
    for (const listener of listeners) {
        const handled = listener(msg, {} as MessageSender, (res: any) => callback?.(res));
        if (handled) break;
    }
});

type MessageMap = {
    getStringLength: (data: string) => number;
    toUpperCase: (str: string) => string;
    sayHello: (data?: string) => string;
    fetchUser: (name: string) => Promise<{ name: string }>;
};

beforeEach(async () => {
    listeners = [];
    jest.clearAllMocks();
});

describe('watch method', () => {
    test('adds and removes the message listener on subscribe and unsubscribe', async () => {
        const message = new Message<MessageMap>();

        expect(listeners.length).toBe(0);

        const unsubscribe = message.watch('getStringLength', (str: string) => str.length);

        expect(listeners.length).toBe(1);
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));

        unsubscribe()

        expect(listeners.length).toBe(0);
        expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalled();
    });

    test('registers a specific handler for a given message type', async () => {
        const message = new Message<MessageMap>();

        message.watch('getStringLength', (str: string) => str.length);
        message.watch('toUpperCase', (str: string) => str.toUpperCase());

        const result_1 = await message.send('getStringLength', 'test')
        const result_2 = await message.send('toUpperCase', 'test')

        expect(result_1).toBe(4);
        expect(result_2).toBe('TEST');
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(2);
    });

    test('registers async handler and resolves with its returned value', async () => {
        const message = new Message<MessageMap>();
        message.watch('fetchUser', (name) => new Promise(resolve => setTimeout(() => resolve({name}), 100)));

        const result = await message.send('fetchUser', 'Tom');

        expect(result).toEqual({name: 'Tom'});
    });

    test('registers multiple handlers using a handler object', async () => {
        const message = new Message<MessageMap>();
        message.watch({
            toUpperCase: (str) => str.toUpperCase(),
            getStringLength: (str) => str.length,
        });

        const result_1 = await message.send('getStringLength', 'test')
        const result_2 = await message.send('toUpperCase', 'test')

        expect(result_1).toBe(4);
        expect(result_2).toBe('TEST');
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
    });

    test('registers a general handler for all message types', async () => {
        const message = new Message<MessageMap>();
        message.watch((type, data) => console.log(`TYPE: ${type}, DATA: ${data}`));

        const result_1 = await message.send('getStringLength', 'test')
        const result_2 = await message.send('toUpperCase', 'test')

        expect(result_1).toBe(undefined);
        expect(result_2).toBe(undefined);
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
    });

    test('prioritizes the first registered handler over others for the same message type', async () => {
        const message = new Message<MessageMap>();

        message.watch('getStringLength', (str: string) => str.length);
        message.watch((type, data) => console.log(`TYPE: ${type}, DATA: ${data}`));

        const result_1 = await message.send('getStringLength', 'test')
        const result_2 = await message.send('toUpperCase', 'test')

        expect(result_1).toBe(4);
        expect(result_2).toBe(undefined);
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(2);
    });
})

describe('send method', () => {
    test('sends a message and returns the correct response from the handler', async () => {
        const message = new Message<MessageMap>();
        message.watch('getStringLength', (str) => str.length);

        const result = await message.send('getStringLength', 'test');

        expect(result).toBe(4);
    });

    test('sends a message without data and receive a correct response from the handler', async () => {
        const message = new Message<MessageMap>();

        message.watch('sayHello', () => 'Hello');

        const result = await message.send('sayHello', undefined);

        expect(result).toBe("Hello");
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));
    });

    test('sends a message with correct structure', async () => {
        const message = new Message<MessageMap>();

        message.watch('getStringLength', (str) => str.length);

        const result = await message.send('getStringLength', 'test');

        expect(result).toBe(4);
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
            {
                id: expect.any(String),
                type: 'getStringLength',
                data: 'test',
                timestamp: expect.any(Number),
            },
            expect.any(Function)
        );
    });

    test('sends a message to tab when options is a number', async () => {
        const message = new Message<MessageMap>();
        message.watch('getStringLength', (str) => str.length);

        const result = await message.send('getStringLength', 'test', 123);

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            123,
            expect.objectContaining({type: 'getStringLength', data: "test"}),
            {frameId: undefined},
            expect.any(Function)
        );
        expect(result).toBe(4);
    });

    test('sends a message to tab when options is a object with tabId and frameId', async () => {
        const message = new Message<MessageMap>();
        message.watch('getStringLength', (str) => str.length);

        const result = await message.send('getStringLength', 'test', {tabId: 123, frameId: 1});

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            123,
            expect.objectContaining({type: 'getStringLength', data: "test"}),
            {frameId: 1},
            expect.any(Function)
        );
        expect(result).toBe(4);
    });
})
