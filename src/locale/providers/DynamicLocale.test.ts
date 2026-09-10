jest.mock("@addon-core/browser", () => ({getI18nMessage: jest.fn(() => "en")}));
jest.mock("@addon-core/storage", () => ({Storage: {Local: jest.fn()}}));
jest.mock("#adnbn/locale", () => ({
    __esModule: true,
    default: require("./tests/fixtures/dynamic/catalogue.json"),
    keys: ["greeting", "items", "app.title", "fallback", "empty", "__proto__"],
    languages: ["en", "fr", "en_GB"],
}));

import {getI18nMessage} from "@addon-core/browser";
import {Storage, type StorageProvider} from "@addon-core/storage";
import DynamicLocale from "./DynamicLocale";
import {Language} from "@typing/locale";

interface Structure {
    greeting: {plural: false; substitutions: ["name"]};
    items: {plural: true; substitutions: ["count"]};
    "app.title": {plural: false; substitutions: []};
    fallback: {plural: false; substitutions: []};
    empty: {plural: false; substitutions: []};
    __proto__: {plural: false; substitutions: []};
}

type Watcher = Record<string, (value: string | undefined) => void>;
const keys = ["greeting", "items", "app.title", "fallback", "empty", "__proto__"];
let stored: string | undefined;
const listeners = new Set<Watcher>();
const notify = (key: string, value: string | undefined) => {
    for (const watcher of listeners) watcher[key]?.(value);
};
const driver = {
    get: jest.fn(async (_key: string) => stored),
    set: jest.fn(async (key: string, value: string) => {
        stored = value;
        notify(key, value);
    }),
    watch: jest.fn((watcher: Watcher) => {
        listeners.add(watcher);
        return () => listeners.delete(watcher);
    }),
};

beforeEach(() => {
    stored = undefined;
    listeners.clear();
    jest.clearAllMocks();
    jest.mocked(getI18nMessage).mockReturnValue("en");
    jest.mocked(Storage.Local).mockReturnValue(driver as unknown as StorageProvider<Record<string, Language>>);
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("reads the initial language from browser i18n and translates synchronously from the catalogue", () => {
    const locale = new DynamicLocale<Structure>();
    expect(locale.lang()).toBe(Language.English);
    expect(locale.trans("greeting", {name: "Ada"})).toBe("Hello Ada");
    expect(locale.trans("app.title")).toBe("Catalogue");
    expect(locale.trans("empty")).toBe("");
    expect(locale.trans("__proto__")).toBe("Ordinary message");
    expect(locale.choice("items", 2, {count: 2})).toBe("2 items");
    expect(getI18nMessage).toHaveBeenCalledTimes(1);
    expect(getI18nMessage).toHaveBeenCalledWith("locale");
    expect(driver.get).not.toHaveBeenCalled();
    expect(driver.watch).not.toHaveBeenCalled();
});

test("normalizes the native marker before selecting catalogue data", () => {
    jest.mocked(getI18nMessage).mockReturnValue("en-GB");
    const locale = new DynamicLocale<Structure>(false);
    expect(locale.lang()).toBe(Language.English);
    expect(locale.trans("app.title")).toBe("Catalogue");
});

test.each(["", "unknown", "de"])("rejects an unavailable native language: %s", marker => {
    jest.mocked(getI18nMessage).mockReturnValue(marker);
    expect(() => new DynamicLocale(false)).toThrow(/Language/);
});

test("keeps public dot keys separate from catalogue keys and returns independent language collections", () => {
    const locale = new DynamicLocale<Structure>(false);
    expect([...locale.keys()]).toEqual(keys);
    expect([...locale.languageNames()]).toEqual([
        [Language.English, "English"],
        [Language.French, "Français"],
        [Language.EnglishGreatBritain, "English (United Kingdom)"],
    ]);
    locale.languages().clear();
    locale.languageNames().clear();
    locale.keys().clear();
    expect(locale.languages().size).toBe(3);
    expect(locale.languageNames().size).toBe(3);
    expect(locale.keys().size).toBe(keys.length);
});

test("switches messages immediately while waiting for storage persistence", async () => {
    const write = Promise.withResolvers<void>();
    driver.set.mockImplementationOnce(() => write.promise);
    const locale = new DynamicLocale<Structure>();
    const saved = locale.change(Language.French);
    expect(locale.lang()).toBe(Language.French);
    expect(locale.trans("greeting", {name: "Ada"})).toBe("Bonjour Ada");
    expect(locale.choice("items", 0, {count: 0})).toBe("0 article");
    expect(locale.trans("fallback")).toBe("Shared default message");
    expect(locale.trans("empty")).toBe("");
    expect(driver.set).toHaveBeenCalledWith("lang", Language.French);
    write.resolve();
    await expect(saved).resolves.toBe(Language.French);
});

test("persists a repeated selection of the current language under the configured key", async () => {
    const locale = new DynamicLocale("chosen-language");
    await locale.change(Language.English);
    expect(driver.set).toHaveBeenCalledWith("chosen-language", Language.English);
    expect(stored).toBe(Language.English);
});

test("rejects write errors without rolling back a newer selection", async () => {
    const write = Promise.withResolvers<void>();
    driver.set.mockImplementationOnce(() => write.promise);
    const locale = new DynamicLocale();
    const first = locale.change(Language.French);
    await locale.change(Language.EnglishGreatBritain);
    const error = new Error("Storage write failed");
    write.reject(error);
    await expect(first).rejects.toBe(error);
    expect(locale.lang()).toBe(Language.EnglishGreatBritain);
});

test("ignores prototype properties and rejects languages absent from the application catalogue", async () => {
    const locale = new DynamicLocale<Record<string, {plural: false; substitutions: []}>>(false);
    const warn = jest.spyOn(console, "warn").mockImplementation();
    expect(locale.trans("toString")).toBe("toString");
    expect(warn).toHaveBeenCalledWith('Locale key "toString" not found in "en" language.');
    await expect(locale.change(Language.German)).rejects.toThrow('Language "de" is not available');
    await expect(locale.change("__proto__" as Language)).rejects.toThrow("is not available");
    expect(locale.lang()).toBe(Language.English);
    expect(driver.set).not.toHaveBeenCalled();
});

test("restores the saved language only through explicit sync, without writing it back", async () => {
    stored = Language.French;
    const locale = new DynamicLocale("chosen-language");
    expect(locale.lang()).toBe(Language.English);
    expect(driver.get).not.toHaveBeenCalled();
    await expect(locale.sync()).resolves.toBe(Language.French);
    expect(driver.get).toHaveBeenCalledWith("chosen-language");
    expect(driver.set).not.toHaveBeenCalled();
});

test.each([undefined, "de", "unknown", "__proto__"])(
    "keeps the current language for invalid or absent storage: %s",
    async value => {
        stored = value;
        const warn = jest.spyOn(console, "warn").mockImplementation();
        const locale = new DynamicLocale();
        await expect(locale.sync()).resolves.toBe(Language.English);
        expect(driver.set).not.toHaveBeenCalled();
        if (value) expect(warn).toHaveBeenCalledWith(`Incorrect language code in storage - "${value}"`);
        else expect(warn).not.toHaveBeenCalled();
    }
);

test("propagates storage read errors without changing the language", async () => {
    const error = new Error("Storage read failed");
    driver.get.mockRejectedValueOnce(error);
    const locale = new DynamicLocale();
    await expect(locale.sync()).rejects.toBe(error);
    expect(locale.lang()).toBe(Language.English);
});

test("applies external changes and own storage events without another write", async () => {
    const locale = new DynamicLocale("chosen-language");
    const handler = jest.fn();
    const stop = locale.watch(handler);
    notify("chosen-language", Language.French);
    expect(locale.lang()).toBe(Language.French);
    expect(handler).toHaveBeenLastCalledWith(Language.French);
    expect(driver.set).not.toHaveBeenCalled();
    await locale.change(Language.English);
    expect(handler).toHaveBeenLastCalledWith(Language.English);
    expect(driver.set).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(2);
    stop();
    stop();
    notify("chosen-language", Language.French);
    expect(locale.lang()).toBe(Language.English);
    expect(listeners.size).toBe(0);
});

test("retains the single-listener contract and permits subscribing again after unwatch", () => {
    const locale = new DynamicLocale();
    locale.watch();
    expect(() => locale.watch()).toThrow("Already subscribed");
    locale.unwatch();
    locale.watch();
    expect(listeners.size).toBe(1);
    locale.unwatch();
    expect(listeners.size).toBe(0);
});

test("reports invalid external changes without changing state or notifying the handler", () => {
    const locale = new DynamicLocale();
    const error = jest.spyOn(console, "error").mockImplementation();
    const handler = jest.fn();
    const stop = locale.watch(handler);
    notify("lang", Language.German);
    notify("lang", undefined);
    expect(error).toHaveBeenCalledWith("Error while changing language:", expect.any(Error));
    expect(handler).not.toHaveBeenCalled();
    expect(locale.lang()).toBe(Language.English);
    expect(driver.set).not.toHaveBeenCalled();
    stop();
});

test("supports memory-only changes without creating storage", async () => {
    const locale = new DynamicLocale(false);
    const changed = locale.change(Language.French);
    expect(locale.lang()).toBe(Language.French);
    await expect(changed).resolves.toBe(Language.French);
    expect(Storage.Local).not.toHaveBeenCalled();
    expect(driver.set).not.toHaveBeenCalled();
    await expect(locale.sync()).rejects.toThrow("Language is not saving in storage");
    expect(() => locale.watch()).toThrow("Language is not saved in storage");
    expect(() => locale.unwatch()).not.toThrow();
});
