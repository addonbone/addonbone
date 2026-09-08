/** @jest-environment node */
import {isContentScriptFrameNavigation, validateContentScriptIsolation} from "./isolation";
import type {ContentScriptFrame} from "@typing/content";

test.each<[ContentScriptFrame | undefined, boolean]>([
    [undefined, false],
    [{height: 320}, false],
    [{page: "panel"}, true],
    [{src: "https://example.com/panel"}, true],
])("recognizes frame navigation without DOM dependencies: %j", (frame, expected) => {
    expect(isContentScriptFrameNavigation(frame)).toBe(expected);
    expect(() => validateContentScriptIsolation("iframe", frame, false)).not.toThrow();
    if (expected)
        expect(() => validateContentScriptIsolation("iframe", frame, true)).toThrow(/cannot be combined with render/);
});
