jest.mock("@addon-core/browser", () => ({
    getI18nMessage: jest.fn(() => "en"),
}));
jest.mock("#adnbn/locale", () => ({
    __esModule: true,
    default: require("./tests/fixtures/catalogue.json"),
    keys: ["demo.empty"],
    languages: ["en", "fr", "ru"],
}));

import {createElement, PropsWithChildren} from "react";
import {act, cleanup, renderHook, waitFor} from "@testing-library/react";
import {getI18nMessage} from "@addon-core/browser";
import LocaleProvider from "./LocaleProvider";
import {createLocaleStorage} from "../../tests/fixtures/storage";
import {useLocale, type LocaleContract} from "./context";
import {Language} from "@typing/locale";

describe("React locale provider", () => {
    const fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch");

    beforeEach(() => {
        jest.mocked(getI18nMessage).mockReset().mockReturnValue("en");
        Object.defineProperty(globalThis, "fetch", {
            configurable: true,
            value: jest.fn(() => {
                throw new Error("Translations must come from the catalogue");
            }),
        });
    });

    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();

        if (fetchDescriptor) {
            Object.defineProperty(globalThis, "fetch", fetchDescriptor);
        } else {
            Reflect.deleteProperty(globalThis, "fetch");
        }
    });

    test("returns an empty map outside a provider", () => {
        const {result} = renderHook(() => useLocale());

        expect(result.current.langs).toEqual(new Map());
        expect(result.current).not.toHaveProperty("languageNames");
    });

    test("returns keys outside a provider, ignoring substitutions and plural counts", () => {
        const {result} = renderHook(() => useLocale());
        const locale = result.current as LocaleContract<{
            "app.title": {plural: false; substitutions: []};
            "app.greeting": {plural: false; substitutions: ["name"]};
            "cart.items": {plural: true; substitutions: ["count"]};
        }>;

        expect(locale.t("app.title")).toBe("app.title");
        expect(locale.t("app.greeting", {name: "Ada"})).toBe("app.greeting");
        expect(locale.choice("cart.items", 2, {count: 2})).toBe("cart.items");
    });

    test("preserves an empty catalogue translation on the first render without warnings or fetching", async () => {
        jest.mocked(getI18nMessage).mockImplementation(key => (key === "locale" ? "ru" : ""));
        const warn = jest.spyOn(console, "warn").mockImplementation();
        const wrapper = ({children}: PropsWithChildren) => createElement(LocaleProvider, {container: false}, children);
        const {result} = renderHook(
            () => {
                const locale = useLocale() as LocaleContract<{
                    "demo.empty": {plural: false; substitutions: []};
                }>;

                return {lang: locale.lang, message: locale.t("demo.empty")};
            },
            {wrapper}
        );

        expect(result.current).toEqual({lang: Language.Russian, message: ""});
        await act(async () => {});
        expect(result.current).toEqual({lang: Language.Russian, message: ""});
        expect(warn).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
        expect(getI18nMessage).toHaveBeenCalledTimes(1);
    });

    test("keeps the available language map stable while changing the selected language", async () => {
        const wrapper = ({children}: PropsWithChildren) => createElement(LocaleProvider, {container: false}, children);
        const {result, rerender} = renderHook(() => useLocale(), {wrapper});

        await act(async () => {});
        const langs = result.current.langs;
        expect([...langs]).toEqual([
            [Language.English, "English"],
            [Language.French, "Français"],
            [Language.Russian, "Русский"],
        ]);

        act(() => result.current.change(Language.French));
        await waitFor(() => expect(result.current.lang).toBe(Language.French));
        rerender();

        expect(result.current.langs).toBe(langs);
        expect([...result.current.langs.keys()]).toEqual([Language.English, Language.French, Language.Russian]);
    });

    test("uses the supplied driver for saved and subsequent selections", async () => {
        const storage = createLocaleStorage(Language.French);
        const wrapper = ({children}: PropsWithChildren) =>
            createElement(LocaleProvider, {container: false, storage}, children);
        const {result} = renderHook(() => useLocale(), {wrapper});
        await waitFor(() => expect(result.current.lang).toBe(Language.French));
        act(() => result.current.change(Language.Russian));
        await waitFor(() => expect(result.current.lang).toBe(Language.Russian));
        await expect(storage.get()).resolves.toBe(Language.Russian);
    });

    test("changes language without storage synchronization when storage is disabled", async () => {
        const wrapper = ({children}: PropsWithChildren) =>
            createElement(LocaleProvider, {container: false, storage: false}, children);
        const {result} = renderHook(() => useLocale(), {wrapper});
        await act(async () => {});
        expect(result.current.lang).toBe(Language.English);
        act(() => result.current.change(Language.French));
        expect(result.current.lang).toBe(Language.French);
    });
});
