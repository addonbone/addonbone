import path from "path";

import ContentParser from "./ContentParser";

import type {ReadonlyConfig} from "@typing/config";
import {ContentScriptWorld} from "@typing/content";

const rootDir = path.resolve(__dirname, "../../../..");
const fixtures = path.resolve(__dirname, "tests", "fixtures", "content");

const parser = new ContentParser({rootDir} as ReadonlyConfig);

const file = (...parts: string[]) => {
    const filename = path.join(fixtures, ...parts);

    return {file: filename, import: filename};
};

describe("ContentParser", () => {
    test.each([
        "named-function",
        "anonymous-function",
        "arrow",
        "local-component",
        "imported-component",
        "reexported-component",
        "jsx",
    ])("rejects frame navigation with default render: %s", name => {
        const target = file("invalid", "default-render", name + ".content.tsx");
        expect(() => parser.options(target)).toThrow(/frame.page\/frame.src cannot be combined with render/);
        expect(() => parser.options(target)).toThrow(target.file);
    });
    test.each(["function.content.tsx", "object.content.ts", "local-object.content.ts", "imported-object.content.ts"])(
        "preserves a valid default export in %s",
        name => {
            const options = parser.options(file("options", "default-render", name));
            expect(options.isolation).toBe(name === "function.content.tsx" ? "shadow" : "iframe");
            expect(options).not.toHaveProperty("render");
        }
    );
    test("resolves a local frame object without treating identifiers as aliases", () => {
        expect(parser.options(file("options", "isolation", "frame-constant.content.ts"))).toMatchObject({
            frame: {page: "panel", height: 320},
        });
    });
    test("parses the isolation enum and frame dimensions", () => {
        expect(parser.options(file("options", "isolation", "iframe.content.ts"))).toMatchObject({
            isolation: "iframe",
            frame: {height: 320},
        });
    });
    test("projects the Shadow isolation mode without runtime properties", () => {
        expect(parser.options(file("options", "isolation", "shadow.content.ts"))).toEqual({
            matches: ["http://*/*", "https://*/*"],
            runAt: "document_idle",
            isolation: "shadow",
        });
    });
    test("resolves a local page alias", () => {
        expect(parser.options(file("options", "isolation", "page.content.ts"))).toMatchObject({
            frame: {page: "panel", width: "80%"},
        });
    });
    test.each([
        ["frame-identifier-page", /statically known string/],
        ["frame-without-isolation", /frame requires/],
        ["frame-conflict", /mutually exclusive/],
        ["frame-render", /cannot be combined/],
        ["frame-auto", /not supported yet/],
        ["frame-spread", /explicit object/],
        ["isolation-dynamic", /statically known/],
        ["frame-dynamic-page", /statically known string/],
        ["frame-dynamic-src", /statically known string/],
    ])("rejects %s with an actionable diagnostic", (name, error) => {
        expect(() => parser.options(file("invalid", name + ".content.ts"))).toThrow(error);
    });
    test.each([
        ["enum.content.ts", ContentScriptWorld.Main],
        ["string.content.ts", ContentScriptWorld.Isolated],
    ])("parses the execution world from %s", (name, world) => {
        expect(parser.options(file("options", "world", name))).toEqual({
            matches: ["http://*/*", "https://*/*"],
            runAt: "document_idle",
            world,
        });
    });
});
