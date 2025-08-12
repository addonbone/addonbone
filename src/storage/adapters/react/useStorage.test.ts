import {act, renderHook, waitFor} from "@testing-library/react";

import {SecureStorage, Storage} from "../../providers";

import useStorage from "./useStorage";

beforeEach(async () => {
    await chrome.storage.local.clear();
});

describe("hook call variants", () => {
    test('accepts single "key" parameter', async () => {
        const {result} = renderHook(() => useStorage("theme"));

        expect(chrome.storage.local.get).toHaveBeenCalledWith("theme", expect.any(Function));
        await waitFor(() => expect(result.current[0]).toBeUndefined());
    });

    test('accepts "key" and "defaultValue" parameters', async () => {
        const {result} = renderHook(() => useStorage("theme", "dark"));

        expect(chrome.storage.local.get).toHaveBeenCalledWith("theme", expect.any(Function));
        await waitFor(() => expect(result.current[0]).toBe("dark"));
    });

    test('accepts object with "key" and "defaultValue"', async () => {
        const {result} = renderHook(() => useStorage({key: "theme", defaultValue: "dark"}));

        expect(chrome.storage.local.get).toHaveBeenCalledWith("theme", expect.any(Function));
        await waitFor(() => expect(result.current[0]).toBe("dark"));
    });

    test('accepts object with "key", "defaultValue" and custom "storage"', async () => {
        const storage = new Storage();
        const {result} = renderHook(() => useStorage({key: "theme", defaultValue: "dark", storage}));

        expect(chrome.storage.local.get).toHaveBeenCalledWith("theme", expect.any(Function));
        await waitFor(() => expect(result.current[0]).toBe("dark"));
    });
});

describe("behavior of default value", () => {
    test("returns default value when no value in storage", async () => {
        const {result} = renderHook(() => useStorage({key: "theme", defaultValue: "dark"}));

        await waitFor(() => expect(result.current[0]).toBe("dark"));
    });

    test("returns stored value instead of defaultValue when available", async () => {
        await chrome.storage.local.set({key: "stored value"});

        const {result} = renderHook(() => useStorage("key", "default value"));

        await waitFor(() => expect(result.current[0]).not.toBe("default value"));
        await waitFor(() => expect(result.current[0]).toBe("stored value"));
    });
});

test("works correctly with SecureStorage instances", async () => {
    const storage = new SecureStorage({namespace: "user"});
    const {result} = renderHook(() => useStorage({key: "theme", storage}));

    act(() => result.current[1]("dark"));

    await waitFor(() => expect(result.current[0]).toBe("dark"));
    expect(await global.storageLocalGet("theme", storage)).not.toBe("dark");
});

test("uses the provided storage instance instead default (Storage.Local)", async () => {
    const storage = new Storage();
    const userStorage = new Storage({namespace: "user"});
    const {result} = renderHook(() => useStorage({key: "theme", storage: userStorage}));

    await storage.set("theme", "light");
    act(() => result.current[1]("dark"));

    await waitFor(() => expect(result.current[0]).toBe("dark"));
    expect(await global.storageLocalGet("theme")).toBe("light");
});

test("sets and retrieves value correctly", async () => {
    const {result} = renderHook(() => useStorage("theme", "light"));

    await waitFor(() => expect(result.current[0]).toBe("light"));

    act(() => result.current[1]("dark"));

    await waitFor(() => expect(result.current[0]).toBe("dark"));

    const storageValue = await global.storageLocalGet("theme");
    expect(storageValue).toBe("dark");
});

test("updates value when storage changes externally", async () => {
    const storage = new Storage();
    const {result} = renderHook(() => useStorage("theme", "light"));

    await waitFor(() => expect(result.current[0]).toBe("light"));

    act(() =>
        global.simulateStorageChange({
            storage,
            key: "theme",
            oldValue: "light",
            newValue: "dark",
        })
    );

    await waitFor(() => expect(result.current[0]).toBe("dark"));
});

test("removes value and resets to undefined", async () => {
    const {result} = renderHook(() => useStorage("volume", 100));

    await waitFor(() => expect(result.current[0]).toBe(100));

    act(() => result.current[2]());

    await waitFor(() => expect(result.current[0]).toBeUndefined());

    const storageValue = await global.storageLocalGet("volume");
    expect(storageValue).toBeUndefined();
});

test("removes watch listener when unmounting", async () => {
    chrome.storage.onChanged.addListener = jest.fn();
    chrome.storage.onChanged.removeListener = jest.fn();

    const {unmount} = renderHook(() => useStorage("theme", "dark"));

    expect(chrome.storage.onChanged.addListener).toHaveBeenCalled();

    unmount();

    expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled();
});
