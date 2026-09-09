import {getRelay} from "./relay";
import {RelayMethod, RelayOptionsRuntimeProperty, type RelayOptions} from "@typing/relay";
import {RelayPermissionGlobalKey} from "@relay/RelayPermission";

// Generated RelayRegistry typing is covered by RelayDeclaration tests; exercise arbitrary runtime maps here.
const getFixtureRelay = getRelay as (name: string, tabId: number) => unknown;

describe("getRelay runtime options", () => {
    const runtimeGlobal = globalThis as typeof globalThis & {
        __webpack_require__?: {[RelayOptionsRuntimeProperty]?: Record<string, RelayOptions>};
    };
    const runtimeDescriptor = Object.getOwnPropertyDescriptor(globalThis, "__webpack_require__");
    const permissionDescriptor = Object.getOwnPropertyDescriptor(globalThis, RelayPermissionGlobalKey);

    afterEach(() => {
        for (const [property, descriptor] of [
            ["__webpack_require__", runtimeDescriptor],
            [RelayPermissionGlobalKey, permissionDescriptor],
        ] as const) {
            if (descriptor) Object.defineProperty(globalThis, property, descriptor);
            else Reflect.deleteProperty(globalThis, property);
        }
    });

    test("creates a proxy from the options in the current entry runtime", () => {
        runtimeGlobal.__webpack_require__ = {
            [RelayOptionsRuntimeProperty]: {collector: {name: "collector", method: RelayMethod.Messaging}},
        };

        expect(getFixtureRelay("collector", 1)).toHaveProperty("__proxy", true);
        expect(() => getFixtureRelay("missing", 1)).toThrow('Failed to get relay "missing"');
    });

    test("does not keep the options map of another runtime", () => {
        runtimeGlobal.__webpack_require__ = {
            [RelayOptionsRuntimeProperty]: {first: {name: "first", method: RelayMethod.Messaging}},
        };
        expect(getFixtureRelay("first", 1)).toHaveProperty("__proxy", true);

        runtimeGlobal.__webpack_require__ = {
            [RelayOptionsRuntimeProperty]: {second: {name: "second", method: RelayMethod.Messaging}},
        };
        expect(getFixtureRelay("second", 1)).toHaveProperty("__proxy", true);
        expect(() => getFixtureRelay("first", 1)).toThrow('Failed to get relay "first"');
    });

    test("preserves the unknown Relay error for a runtime without Relay data", () => {
        runtimeGlobal.__webpack_require__ = {};
        expect(() => getFixtureRelay("missing", 1)).toThrow('Failed to get relay "missing"');
    });
});
