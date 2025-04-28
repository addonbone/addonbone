import path from "path";

import OptionFile from "../OptionFile";

test('background with definition function', () => {
    const filename = path.resolve(__dirname, 'fixtures', 'backgroundWithDefinitionFunction.ts');

    const options = OptionFile.make(filename)
        .setProperties(['persistent', 'includeBrowser'])
        .setDefinition('defineBackground')
        .getOptions();

    expect(options).toEqual({
        persistent: true,
        includeBrowser: ['firefox'],
    });
});


test('background with default function and export properties', () => {
    const filename = path.resolve(__dirname, 'fixtures', 'backgroundWithDefaultFunction.ts');

    const options = OptionFile.make(filename)
        .setProperties(['persistent', 'excludeBrowser'])
        .setDefinition('defineBackground')
        .getOptions();

    expect(options).toEqual({
        persistent: true,
        excludeBrowser: ['edge'],
    });
});

test('background with combined definition and export properties', () => {
    const filename = path.resolve(__dirname, 'fixtures', 'backgroundCombinedDefinition.ts');

    const options = OptionFile.make(filename)
        .setProperties(['persistent', 'excludeBrowser', 'includeBrowser'])
        .setDefinition('defineBackground')
        .getOptions();

    expect(options).toEqual({
        persistent: true,
        excludeBrowser: ['edge'],
        includeBrowser: ['firefox'],
    });
});

test('background with default object and export properties', () => {
    const filename = path.resolve(__dirname, 'fixtures', 'backgroundWithDefaultObject.ts');

    const options = OptionFile.make(filename)
        .setProperties(['persistent', 'excludeBrowser', 'includeBrowser'])
        .setDefinition('defineBackground')
        .getOptions();

    console.log(options);

    expect(options).toEqual({
        persistent: true,
        excludeBrowser: ['opera'],
        includeBrowser: ['chrome'],
    });
});

test('background with default type name', () => {
    const filename = path.resolve(__dirname, 'fixtures', 'backgroundWithDefaultTypeName.ts');

    const options = OptionFile.make(filename)
        .setProperties(['persistent', 'excludeBrowser', 'includeBrowser'])
        .setDefinition('defineBackground')
        .getOptions();


    expect(options).toEqual({
        persistent: true,
        excludeBrowser: ['safari'],
        includeBrowser: ['chromium'],
    });
});

test('background with default satisfies', () => {
    const filename = path.resolve(__dirname, 'fixtures', 'backgroundWithDefaultSatisfies.ts');

    const options = OptionFile.make(filename)
        .setProperties(['persistent', 'excludeBrowser', 'includeBrowser'])
        .setDefinition('defineBackground')
        .getOptions();

    expect(options).toEqual({
        persistent: true,
        includeBrowser: ['chromium'],
    });
});