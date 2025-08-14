import React from "react";
import {act, renderHook} from "@testing-library/react";
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
    // @ts-ignore - test-only access to manager
    message["manager"].clear();
});

function useHarness<K extends keyof MessageMap>(type: K, handler: MessageMap[K]) {
    const rendersRef = React.useRef(0);
    rendersRef.current++;

    // Using explicit generics to match hook signature order <K, T>
    useMessageHandler<K, MessageMap>(type as any, handler as any);

    return {renders: rendersRef.current};
}

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

test("does not resubscribe on handler change, resubscribes on type change", async () => {
    expect(chrome.runtime.onMessage.hasListeners()).toBe(false);

    const {rerender} = renderHook(
        ({type, handler}) => useMessageHandler<"getStringLength" | "toUpperCase", MessageMap>(type as any, handler),
        {
            initialProps: {type: "getStringLength" as const, handler: (str: string) => str.length},
        }
    );

    expect(chrome.runtime.onMessage.hasListeners()).toBe(true);

    expect(await message.send("getStringLength", "test")).toBe(4);

    const addCallsAfterMount = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls.length;
    const removeCallsAfterMount = (chrome.runtime.onMessage.removeListener as jest.Mock).mock.calls.length;

    rerender({type: "getStringLength", handler: (str: string) => str.length / 2});

    // No resubscribe on handler change
    expect((chrome.runtime.onMessage.removeListener as jest.Mock).mock.calls.length).toBe(removeCallsAfterMount);
    expect((chrome.runtime.onMessage.addListener as jest.Mock).mock.calls.length).toBe(addCallsAfterMount);

    expect(await message.send("getStringLength", "test")).toBe(2);

    // Change type -> should resubscribe
    // @ts-ignore
    rerender({type: "toUpperCase", handler: (str: string) => str.toUpperCase()});

    expect((chrome.runtime.onMessage.removeListener as jest.Mock).mock.calls.length).toBe(removeCallsAfterMount + 1);
    expect((chrome.runtime.onMessage.addListener as jest.Mock).mock.calls.length).toBe(addCallsAfterMount + 1);

    expect(await message.send("toUpperCase", "test")).toBe("TEST");
    expect(await message.send("getStringLength", "test")).toBe(undefined);
});

test("uses Message.getInstance and does not recreate between rerenders", () => {
    const spy = jest.spyOn(Message, "getInstance");

    const {rerender, unmount} = renderHook(
        ({handler}) => useMessageHandler<"sayHello", MessageMap>("sayHello", handler),
        {
            initialProps: {handler: (name?: string) => `Hello ${name ?? ""}`.trim()},
        }
    );

    expect(spy).toHaveBeenCalledTimes(1);

    rerender({handler: (name?: string) => `Hi ${name ?? ""}`.trim()});

    expect(spy).toHaveBeenCalledTimes(1);

    unmount();
});

test("does not rerender on incoming message if handler doesn't touch state", async () => {
    const {result} = renderHook(() => useHarness("sayHello", (data?: string) => (data ? `Hello ${data}` : "Hello")));

    expect(result.current.renders).toBe(1);

    await act(async () => {
        await message.send("sayHello", "John");
    });

    expect(result.current.renders).toBe(1);
});

test("changing handler causes no resubscribe and only the expected one rerender", () => {
    const {result, rerender} = renderHook(({handler}) => useHarness("getStringLength", handler as any), {
        initialProps: {handler: (str: string) => str.length},
    });

    const addCalls = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls.length;
    const removeCalls = (chrome.runtime.onMessage.removeListener as jest.Mock).mock.calls.length;
    const rendersBefore = result.current.renders;

    rerender({handler: (str: string) => Math.floor(str.length / 2)});

    expect((chrome.runtime.onMessage.addListener as jest.Mock).mock.calls.length).toBe(addCalls);
    expect((chrome.runtime.onMessage.removeListener as jest.Mock).mock.calls.length).toBe(removeCalls);
    expect(result.current.renders).toBe(rendersBefore + 1);
});

test("changing type resubscribes and only one rerender occurs", () => {
    const {result, rerender} = renderHook(({type}) => useHarness(type as any, ((s: string) => s.length) as any), {
        initialProps: {type: "getStringLength" as const},
    });

    const addCalls = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls.length;
    const removeCalls = (chrome.runtime.onMessage.removeListener as jest.Mock).mock.calls.length;
    const rendersBefore = result.current.renders;

    rerender({type: "toUpperCase" as any});

    expect((chrome.runtime.onMessage.addListener as jest.Mock).mock.calls.length).toBe(addCalls + 1);
    expect((chrome.runtime.onMessage.removeListener as jest.Mock).mock.calls.length).toBe(removeCalls + 1);
    expect(result.current.renders).toBe(rendersBefore + 1);
});

test("works correctly under StrictMode (no leaked listeners)", () => {
    const Wrapper: React.FC<{children: React.ReactNode}> = ({children}) =>
        React.createElement(React.StrictMode, null, children);

    const {unmount} = renderHook(() => useMessageHandler<"sayHello", MessageMap>("sayHello", () => "pong"), {
        wrapper: Wrapper as any,
    });

    expect(chrome.runtime.onMessage.hasListeners()).toBe(true);

    unmount();

    expect(chrome.runtime.onMessage.hasListeners()).toBe(false);
});
