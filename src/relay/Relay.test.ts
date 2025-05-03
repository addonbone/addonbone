import {isAvailableScripting} from '@browser/scripting';

import ProxyRelay from "./ProxyRelay";
import RegisterRelay from "./RegisterRelay";
import RelayManager from "./RelayManager";

import {getRegisteredRelay, getRelay} from "./index";
import {RelayWindowKey} from "../types/relay";

const MatchRelay = {
    sum: (a: number, b: number): number => a + b,
    asyncSum: (a: number, b: number): Promise<number> => {
        return new Promise(resolve => setTimeout(() => resolve(a + b), 100))
    },
    one: 1,
    obj: {
        concat: (a: string, b: string): string => a + ' ' + b,
        zero: 0,
    },
}

type RelayType = typeof MatchRelay;

const relayName = 'math'

beforeEach(async () => {
    jest.clearAllMocks();

    RelayManager.getInstance().clear()

    new RegisterRelay<RelayType>(relayName, () => MatchRelay).register();
});

describe('ProxyRelay', () => {
    beforeEach(async () => {
        (isAvailableScripting as jest.Mock).mockReturnValue(true);
    });

    test('throws an error when get() is called in content script context', async () => {
        (isAvailableScripting as jest.Mock).mockReturnValue(false);

        const proxy = new ProxyRelay(relayName);

        expect(() => proxy.get(1)).toThrow(`You are trying to get proxy relay ${relayName} from script content. You can get original relay instead`);
    });

    test('works with getRelay helper', async () => {
        const relay = getRelay(relayName, 1);

        expect(relay['__proxy']).toBe(true);
    });

    test("returns a proxy when called not in content script context", () => {
        const relay = new ProxyRelay<RelayType>(relayName).get(1);

        expect(relay['__proxy']).toBe(true);
    });

    test("invokes remote methods using chrome.scripting", async () => {
        const relay = new ProxyRelay<RelayType>(relayName).get(1)

        expect(await relay.sum(1, 2)).toBe(3)

        expect(chrome.scripting.executeScript).toHaveBeenCalledTimes(1)

        expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
            expect.objectContaining({
                target: {tabId: 1},
                func: expect.any(Function),
                args: [relayName, "sum", [1, 2], RelayWindowKey],
            }),
        );
    });

    test("accesses primitive value as method on the relay object", async () => {
        const relay = new ProxyRelay<RelayType>(relayName).get({tabId: 1, frameIds: [2]})

        expect(await relay.one()).toBe(1)
        expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
            expect.objectContaining({
                target: {tabId: 1, frameIds: [2]},
                func: expect.any(Function),
                args: [relayName, "one", [], RelayWindowKey],
            }),
        );
    });

    test("accesses nested method or property ", async () => {
        const relay = new ProxyRelay<RelayType>(relayName).get(1)

        expect(await relay.obj.concat('Hello', 'world')).toBe('Hello world')
        expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
            expect.objectContaining({
                target: {tabId: 1},
                func: expect.any(Function),
                args: [relayName, "obj.concat", ['Hello', 'world'], RelayWindowKey],
            }),
        );

        expect(await relay.obj.zero()).toBe(0)
        expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
            expect.objectContaining({
                target: {tabId: 1},
                func: expect.any(Function),
                args: [relayName, "obj.zero", [], RelayWindowKey],
            }),
        );
    });

    test("calls async method on proxy and returns resolved value", async () => {
        const relay = new ProxyRelay<RelayType>(relayName).get(1)

        expect(await relay.asyncSum(1, 2)).toBe(3)
    });
})

describe('RegisterRelay', () => {
    beforeEach(async () => {
        (isAvailableScripting as jest.Mock).mockReturnValue(false);
    });

    test('throws if trying to get registered relay from non-content script', async () => {
        (isAvailableScripting as jest.Mock).mockReturnValue(true);

        const proxy = new RegisterRelay(relayName, () => MatchRelay);

        expect(() => proxy.get()).toThrow(`Relay "${relayName}" can be getting only from content script`);
    });

    test('works with getRegisteredRelay helper', async () => {
        const relay = getRegisteredRelay(relayName);

        expect(relay['__proxy']).toBe(undefined);
    });

    test("returns real relay when called in content script context", () => {
        const relay = new RegisterRelay<RelayType>(relayName, () => MatchRelay).get();

        expect(relay['__proxy']).toBe(undefined);
    });

    test("calls method directly in content script without chrome.scripting", async () => {
        const relay = new RegisterRelay<RelayType>(relayName, () => MatchRelay).get()

        expect(relay.sum(1, 2)).toBe(3)
        expect(chrome.scripting.executeScript).toHaveBeenCalledTimes(0);
    });

    test("throws an error when attempting to register the same relay twice", async () => {
        const relay = new RegisterRelay<RelayType>(relayName, () => MatchRelay)

        expect(() => relay.register()).toThrow(`A relay with the name "${relayName}" already exists. The relay name must be unique.`);
    });
})
