import path from "path";

import ExpressionFile from "../ExpressionFile";

const fixtures = path.resolve(__dirname, "fixtures");

describe("default function", () => {
    test("export default function and return instance class", () => {
        const filename = path.join(fixtures, "expression", "export-instance.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe("{ bar: string; getBar(): string; setBar(bar: string): void; }");
    });

    test("export default function and return instance class with chrome types", () => {
        const filename = path.join(fixtures, "expression", "export-instance-chrome-types.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe("{ create(properties: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab>; get(): Promise<chrome.tabs.Tab[]>; tab(): chrome.tabs.Tab | undefined; remove(tabId: number): Promise<void>; update(tab: chrome.tabs.Tab, properties: chrome.tabs.CreateProperties): Promise<void>; }");
    });

    test("export default function and return extended instance class", () => {
        const filename = path.join(fixtures, "expression", "export-extended-instance.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe(
            "{ name: string; version: number; getUsersMap(): Record<string, {name: string}>; getServiceInfo(): {name: string, version: number}; fetchData<T>(endpoint: string): Promise<T>; isInitialized(): boolean; getUserRoute(): string; fetchUserData<T>(endpoint: string): Promise<T>; }"
        );
    });

    test("export default function and return default extended instance class", () => {
        const filename = path.join(fixtures, "expression", "export-default-extended-instance.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe(
            "{ name: string; age: number; getInfo(): string; updateAge(newAge: number): void; id(): number; getUserName(): string; }"
        );
    });

    test("export default function and return inline class instance", () => {
        const filename = path.join(fixtures, "expression", "export-instance-inside.ts");
        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe("{ bar: string; getBar(): string; setBar(bar: string): this; }");
    });

    test("export default function and return instance class inside", () => {
        const filename = path.join(fixtures, "expression", "export-instance-inside.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe("{ bar: string; getBar(): string; setBar(bar: string): this; }");
    });

    test("export default function and return object", () => {
        const filename = path.join(fixtures, "expression", "export-object-inside.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe("{ foo: string; getFoo(): string; setFoo(foo: string): void; }");
    });

    test("export default function and return object through variable", () => {
        const filename = path.join(fixtures, "expression", "export-object-through-var.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe("{ getName(): string; getAge(): any; getAddress(): any; getPhone(): any; getEmail(): any; }");
    });

    test("export default function and return instance when type separated", () => {
        const filename = path.join(fixtures, "expression", "export-instance-with-separate-types.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe("{ getBar(): {bar: string;}; getBarWithFoo(): {bar: string; foo: string;}; }");
    });

    test("export default function and return instance when type is external", () => {
        const filename = path.join(fixtures, "expression", "export-instance-with-external-types.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe(
            "{ getUserInfo(): {id: number; name: string;}; getUserDetails(): {id: number; name: string; address?: string; age?: number; data?: {reg: number; log: number;};}; getUserAndDetails(): {id: number; name: string; address?: string; age?: number; data?: {reg: number; log: number;};}; }"
        );
    });

    test("export default function and return instance with external library types", () => {
        const filename = path.join(fixtures, "expression", "export-instance-external-types.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe("{ extra: import('somelib').ExtraType; getExtra(): import('somelib').ExtraType; setExtra(extra: import('somelib').ExtraType): void; }");
    });

    test("export default function and return instance with external library types using type import", () => {
        const filename = path.join(fixtures, "expression", "export-instance-external-types-alt.ts");

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe("{ extra: import('somelib').ExtraType; getExtra(): import('somelib').ExtraType; setExtra(extra: import('somelib').ExtraType): void; }");
    });

    test("export init function and return instance with external library types using import type", () => {
        const filename = path.join(fixtures, "expression", "export-init-function-external-types-type.ts");

        const type = ExpressionFile.make(filename).setProperty('init').getType();

        expect(type).toBe("{ extra: import('somelib').ExtraType; getExtra(): import('somelib').ExtraType; setExtra(extra: import('somelib').ExtraType): void; }");
    });
});

describe("named function", () => {
    test("export function as const", () => {
        const filename = path.join(fixtures, "expression", "export-instance-as-const.ts");

        const type = ExpressionFile.make(filename).setProperty("init").getType();

        expect(type).toBe("{ bar: string; getBar(): string; setBar(bar: string): void; }");
    });
});

describe("export default function", () => {
    test("export default definition function instance", () => {
        const filename = path.join(fixtures, "expression", "definition-function-instance.ts");

        const type = ExpressionFile.make(filename).setDefinition("defineService").getType();

        expect(type).toBe("{ persistent: boolean; name: string; init(): any; }");
    });

    test("ignore non-package wrapper for definition", () => {
        const filename = path.join(fixtures, "expression", "export-nonpkg-wrapper.ts");

        const type = ExpressionFile.make(filename).setProperty("init").setDefinition("fakeWrapper").getType();

        expect(type).toBeUndefined();
    });
});

describe("assertions and satisfies", () => {
    test("object literal with as const assertion", () => {
        const filename = path.join(fixtures, "expression", "default-object-assertion.ts");
        const type = ExpressionFile.make(filename).getType();
        expect(type).toBe("{ foo: string; getFoo(): string; }");
    });

    test("object literal with satisfies expression", () => {
        const filename = path.join(fixtures, "expression", "default-object-satisfies.ts");
        const type = ExpressionFile.make(filename).getType();
        // return type not explicitly annotated, so falls back to any
        expect(type).toBe("{ foo: string; getFoo(): any; }");
    });
});

describe("wrapper parentheses", () => {
    test("export default wrapped in parentheses around definition function", () => {
        const filename = path.join(fixtures, "expression", "default-wrapper-parens.ts");
        const type = ExpressionFile.make(filename).setDefinition("defineService").getType();
        expect(type).toBe("{ persistent: boolean; name: string; init(): any; }");
    });
});

describe("definition wrapper edge cases", () => {
    test("wrapper defined with no arguments returns undefined", () => {
        const filename = path.join(fixtures, "expression", "default-wrapper-no-args.ts");
        const type = ExpressionFile.make(filename).setDefinition("defineService").getType();
        expect(type).toBeUndefined();
    });
});

describe("alias wrappers", () => {
    test("alias import for definition function", () => {
        const filename = path.join(fixtures, "expression", "default-alias-definition.ts");
        const type = ExpressionFile.make(filename).setDefinition("svc").getType();
        expect(type).toBe("{ persistent: boolean; name: string; init(): any; }");
    });
});

describe("default object property extractor", () => {
    const filename = path.join(fixtures, "expression", "default-literal-props.ts");

    test("extract string property", () => {
        const type = ExpressionFile.make(filename).setProperty("str").getType();
        expect(type).toBe("string");
    });

    test("extract number property", () => {
        const type = ExpressionFile.make(filename).setProperty("num").getType();
        expect(type).toBe("number");
    });

    test("extract method property", () => {
        const type = ExpressionFile.make(filename).setProperty("greet").getType();
        expect(type).toBe("(s: string) => string");
    });

    test("nonexistent property returns undefined", () => {
        const type = ExpressionFile.make(filename).setProperty("other").getType();
        expect(type).toBeUndefined();
    });
});

describe("object literal init extraction", () => {
    test("init returning class instance inside object literal", () => {
        const filename = path.join(fixtures, "expression", "export-object-init-instance.ts");
        const type = ExpressionFile.make(filename).setProperty("init").getType();
        expect(type).toBe("{ bar: string; getBar(): string; }");
    });

    test("init returning object literal inside object literal", () => {
        const filename = path.join(fixtures, "expression", "export-object-init-object.ts");
        const type = ExpressionFile.make(filename).setProperty("init").getType();
        expect(type).toBe("{ some(): string; num: number; }");
    });
});
