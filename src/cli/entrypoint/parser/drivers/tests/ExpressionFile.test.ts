import path from "path";

import ExpressionFile from "../ExpressionFile";

const fixtures = path.resolve(__dirname, 'fixtures');

describe('default function', () => {
    test('export default function and return instance class', () => {
        const filename = path.join(fixtures, 'expression', 'export-instance.ts');

        const type = ExpressionFile.make(filename)
            .getType();

        expect(type).toBe('{ bar: string; getBar(): string; setBar(bar: string): void; }');
    });

    test('export default function and return extended instance class', () => {
        const filename = path.join(fixtures, 'expression', 'export-extended-instance.ts');

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe(' { name: string; version: number; getUsersMap(): Record<string, {name: string}>; getServiceInfo(): {name: string, version: number}; fetchData<T>(endpoint: string): Promise<T>; isInitialized(): boolean; getUserRoute(): string; fetchUserData<T>(endpoint: string): Promise<T>; }');
    });

    test('export default function and return inline class instance', () => {
        const filename = path.join(fixtures, 'expression', 'export-instance-inside.ts');
        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe('{ bar: string; getBar(): string; setBar(bar: string): this; }');
    });

    test('export default function and return instance class inside', () => {
        const filename = path.join(fixtures, 'expression', 'export-instance-inside.ts');

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe('{ bar: string; getBar(): string; setBar(bar: string): this; }');
    });

    test('export default function and return object', () => {
        const filename = path.join(fixtures, 'expression', 'export-object-inside.ts');

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe('{ foo: string; getFoo(): string; setFoo(foo: string): void; }');
    });

    test('export default function and return object through variable', () => {
        const filename = path.join(fixtures, 'expression', 'export-object-through-var.ts');

        const type = ExpressionFile.make(filename).getType();

        expect(type).toBe(' { getName(): string; getAge(): any; getAddress(): any; getPhone(): any; getEmail(): any; }');
    });
});

describe('named function', () => {
    test('export function as const', () => {
        const filename = path.join(fixtures, 'expression', 'export-instance-as-const.ts');

        const type = ExpressionFile.make(filename).setProperty('init').getType();

        expect(type).toBe('{ bar: string; getBar(): string; setBar(bar: string): void; }');
    });
});

describe('export default function', () => {
    test('export default definition function instance', () => {
        const filename = path.join(fixtures, 'expression', 'definition-function-instance.ts');

        const type = ExpressionFile.make(filename)
            .setDefinition('defineService')
            .getType();

        expect(type).toBe('{ persistent: boolean; name: string; init(): any; }');
    });

    test('ignore non-package wrapper for definition', () => {
        const filename = path.join(fixtures, 'expression', 'export-nonpkg-wrapper.ts');

        const type = ExpressionFile.make(filename)
            .setProperty('init')
            .setDefinition('fakeWrapper')
            .getType();

        expect(type).toBeUndefined();
    });
});