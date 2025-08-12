import {filterHostPatterns} from "./utils";

const toSet = (arr: string[]) => new Set(arr);
const setToArray = (set: Set<string>) => Array.from(set);

describe("filterHostPatterns", () => {
    test("returns only <all_urls> when present", () => {
        const input = toSet(["<all_urls>", "https://*/*", "http://example.com/*", "chrome-extension://*/*"]);

        const result = filterHostPatterns(input);

        expect(setToArray(result).sort()).toEqual(["<all_urls>"]);
    });

    test("handles *://*/* covering http and https but not special or other schemes", () => {
        const input = toSet([
            "*://*/*",
            "http://*/*",
            "https://*/*",
            "https://example.com/*",
            "http://another.example/*",
            "file://*/*",
            "file://Downloads/*",
            "chrome-extension://*/*",
        ]);

        const result = filterHostPatterns(input);

        expect(new Set(result)).toEqual(toSet(["*://*/*", "file://*/*", "chrome-extension://*/*"]));
    });

    test("http wildcard covers only http; https specifics remain", () => {
        const input = toSet(["http://*/*", "http://example.com/*", "https://example.com/*"]);

        const result = filterHostPatterns(input);

        expect(new Set(result)).toEqual(toSet(["http://*/*", "https://example.com/*"]));
    });

    test("both http and https wildcards present; ftp specific remains", () => {
        const input = toSet([
            "http://*/*",
            "https://*/*",
            "https://site.com/*",
            "http://site.com/*",
            "ftp://example.com/*",
        ]);

        const result = filterHostPatterns(input);

        expect(new Set(result)).toEqual(toSet(["http://*/*", "https://*/*", "ftp://example.com/*"]));
    });

    test("special schemes are never considered covered by *://*/*", () => {
        const input = toSet([
            "*://*/*",
            "chrome-extension://*/*",
            "moz-extension://*/*",
            "data://*/*",
            "blob://*/*",
            "filesystem://*/*",
            "about://*/*",
            "chrome://*/*",
            "resource://*/*",
        ]);

        const result = filterHostPatterns(input);

        expect(new Set(result)).toEqual(
            toSet([
                "*://*/*",
                "chrome-extension://*/*",
                "moz-extension://*/*",
                "data://*/*",
                "blob://*/*",
                "filesystem://*/*",
                "about://*/*",
                "chrome://*/*",
                "resource://*/*",
            ])
        );
    });
});
