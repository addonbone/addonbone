import {renderHook} from "@testing-library/react";
import useMessageHandler from "./useMessageHandler";
import {Message} from "../../providers";

type MessageMap = {
    getStringLength: (data: string) => number;
    toUpperCase: (str: string) => string;
    sayHello: (data?: string) => string;
    fetchUser: (name: string) => Promise<{name: string}>;
};

let message: Message<MessageMap>;

beforeEach(() => {
    jest.clearAllMocks();
    message = new Message<MessageMap>();
    message["manager"].clear();
});

test("registers a specific handler for a given message type", async () => {
    expect(chrome.runtime.onMessage.hasListeners()).toBe(false);

    renderHook(() => useMessageHandler<"getStringLength", MessageMap>("getStringLength", str => str.length));

    expect(chrome.runtime.onMessage.hasListeners()).toBe(true);
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));

    const result = await message.send("getStringLength", "test");

    expect(result).toBe(4);
});

test("adds and removes the listener on mount and unmount", async () => {
    expect(chrome.runtime.onMessage.hasListeners()).toBe(false);

    const {unmount} = renderHook(() => {
        useMessageHandler<"getStringLength", MessageMap>("getStringLength", str => str.length);
    });

    expect(chrome.runtime.onMessage.hasListeners()).toBe(true);
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));

    unmount();

    expect(chrome.runtime.onMessage.hasListeners()).toBe(false);
    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(expect.any(Function));
});

test("updates subscription when type or handler changes", async () => {
    expect(chrome.runtime.onMessage.hasListeners()).toBe(false);

    const {rerender} = renderHook(({type, handler}) => useMessageHandler(type, handler), {
        initialProps: {type: "getStringLength", handler: (str: string) => str.length},
    });

    expect(chrome.runtime.onMessage.hasListeners()).toBe(true);

    expect(await message.send("getStringLength", "test")).toBe(4);

    rerender({type: "getStringLength", handler: (str: string) => str.length / 2});

    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(expect.any(Function));

    expect(await message.send("getStringLength", "test")).toBe(2);

    //@ts-ignore
    rerender({type: "toUpperCase", handler: (str: string) => str.toUpperCase()});

    expect(await message.send("toUpperCase", "test")).toBe("TEST");
    expect(await message.send("getStringLength", "test")).toBe(undefined);
});
