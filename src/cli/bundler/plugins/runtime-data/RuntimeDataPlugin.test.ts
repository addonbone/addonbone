/** @jest-environment node */
import fs from "fs";
import os from "os";
import path from "path";
import vm from "vm";
import {
    rspack,
    type Compiler,
    type Configuration,
    type Filename,
    type RspackPluginInstance,
    type Stats,
} from "@rspack/core";

import RuntimeDataPlugin, {type RuntimeDataPluginData} from "./RuntimeDataPlugin";

const run = (compiler: Compiler): Promise<Stats> =>
    new Promise((resolve, reject) =>
        compiler.run((error, stats) => {
            if (error || !stats || stats.hasErrors())
                reject(error ?? new Error(stats?.toString({all: false, errors: true})));
            else resolve(stats);
        })
    );

const filenames = (stats: Stats): string[] =>
    stats.compilation
        .getAssets()
        .map(asset => asset.name)
        .sort();

const readData = (stats: Stats, file: string, property: string): unknown => {
    const sandbox: {readRuntimeData?: (property: string) => unknown} = {};
    vm.runInNewContext(stats.compilation.getAsset(file)!.source.source().toString(), sandbox);
    return sandbox.readRuntimeData!(property);
};

describe("RuntimeDataPlugin", () => {
    let directory: string;
    let compiler: Compiler;

    const build = (
        plugins: RspackPluginInstance[],
        filename: Filename = "[name].js",
        optimization?: Configuration["optimization"]
    ): Compiler =>
        rspack({
            context: path.join(__dirname, "tests/fixtures"),
            mode: "production",
            devtool: false,
            entry: {first: "./entry.js", second: "./entry.js"},
            output: {path: directory, filename, clean: true},
            optimization,
            plugins,
        });

    beforeEach(() => {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), "adnbn-runtime-data-"));
    });

    afterEach(async () => {
        await new Promise<void>((resolve, reject) => compiler.close(error => (error ? reject(error) : resolve())));
        fs.rmSync(directory, {recursive: true, force: true});
    });

    test.each<Filename>([
        "[name].js",
        "[name].[contenthash:8].js",
        "[name].[chunkhash:8].js",
        "[name].[fullhash:8].js",
        data => `custom/${data.chunk?.name}.[contenthash:8].js`,
    ])("updates every runtime without extra files using filename %s", async filename => {
        const property = "fixtureData";
        const plugin = new RuntimeDataPlugin({property, data: {panel: "panel.html"}});
        compiler = build([plugin], filename);

        const first = await run(compiler);
        const firstFiles = filenames(first);
        expect(firstFiles).toHaveLength(2);
        for (const file of firstFiles) expect(readData(first, file, property)).toEqual({panel: "panel.html"});

        plugin.update({renamed: "panel.html"});
        const second = await run(compiler);
        const secondFiles = filenames(second);
        expect(secondFiles).toHaveLength(2);
        for (const file of secondFiles) expect(readData(second, file, property)).toEqual({renamed: "panel.html"});
        if (filename !== "[name].js") expect(secondFiles).not.toEqual(firstFiles);

        const repeated = await run(compiler);
        // Rspack's fullhash changes on repeated compilations even without a data plugin.
        if (filename !== "[name].[fullhash:8].js") expect(filenames(repeated)).toEqual(secondFiles);
        for (const file of filenames(repeated))
            expect(readData(repeated, file, property)).toEqual({renamed: "panel.html"});
    });

    test("selects entries and drops stale data when selection changes between compilations", async () => {
        let selected = "first";
        const plugin = new RuntimeDataPlugin({
            property: "fixture",
            data: {value: 1},
            test: entry => entry === selected,
        });
        compiler = build([plugin]);
        for (const entry of ["first", "second", "first"]) {
            selected = entry;
            plugin.update({value: entry});
            const stats = await run(compiler);
            expect(readData(stats, `${entry}.js`, "fixture")).toEqual({value: entry});
            const excluded = entry === "first" ? "second" : "first";
            expect(readData(stats, `${excluded}.js`, "fixture")).toBeUndefined();
        }
    });

    test("selects a shared runtime by its consuming entries and adds each property only once", async () => {
        const selected: string[] = [];
        compiler = build(
            [
                new RuntimeDataPlugin({
                    property: "fixture",
                    data: {shared: true},
                    test: entry => {
                        selected.push(entry);
                        return entry === "second";
                    },
                }),
            ],
            "[name].js",
            {runtimeChunk: {name: "shared-runtime"}}
        );
        const attached: string[] = [];
        compiler.hooks.thisCompilation.tap("CountRuntimeDataFixture", compilation => {
            compilation.hooks.runtimeModule.tap("CountRuntimeDataFixture", (module, chunk) => {
                if (module.identifier().endsWith('runtime data "fixture"')) attached.push(chunk.name!);
            });
        });
        const stats = await run(compiler);
        const runtime = stats.compilation.entrypoints.get("first")!.getRuntimeChunk()!;
        expect(runtime).toBe(stats.compilation.entrypoints.get("second")!.getRuntimeChunk());
        expect(selected).toEqual(["first", "second"]);
        expect(attached).toEqual(["shared-runtime"]);

        // Repeating the hook must not add a second runtime module for the same property.
        stats.compilation.hooks.additionalTreeRuntimeRequirements.call(runtime, new Set<string>());
        expect(attached).toEqual(["shared-runtime"]);
        expect(filenames(stats)).toEqual(["first.js", "second.js", "shared-runtime.js"]);
    });

    test("preserves literal strings and object keys without treating them as code or template markers", async () => {
        const property = 'slot"]["__ADNBN_DATA__$&\\\n';
        const data = {
            text: "$& $` $' __ADNBN_REQUIRE__ __ADNBN_DATA__ \" \\ \n \u2028",
            nested: [null, true, false, 12.5, {value: "text"}],
            object: JSON.parse('{"__proto__":{"value":"own property"}}'),
        };
        compiler = build([
            new RuntimeDataPlugin({property, data}),
            new RuntimeDataPlugin({property: "__proto__", data: "second slot"}),
        ]);
        const stats = await run(compiler);
        for (const file of filenames(stats)) {
            expect(readData(stats, file, property)).toEqual(data);
            expect(readData(stats, file, "__proto__")).toBe("second slot");
        }
    });

    test("freezes data for one compilation even if update runs before its runtime modules are generated", async () => {
        const data = {value: "first"};
        const plugin = new RuntimeDataPlugin({property: "snapshot", data});
        compiler = build([
            plugin,
            {
                apply(compiler) {
                    compiler.hooks.thisCompilation.tap("UpdateDataFixture", () => {
                        data.value = "mutated";
                        plugin.update({value: "next"});
                    });
                },
            },
        ]);
        const first = await run(compiler);
        for (const file of filenames(first)) expect(readData(first, file, "snapshot")).toEqual({value: "first"});
        const next = await run(compiler);
        for (const file of filenames(next)) expect(readData(next, file, "snapshot")).toEqual({value: "next"});
    });

    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    test.each([
        ["undefined", {nested: undefined}],
        ["function", {nested: () => 1}],
        ["symbol", Symbol("data")],
        ["symbol key", {[Symbol("key")]: 1}],
        ["bigint", BigInt(1)],
        ["NaN", NaN],
        ["infinity", Infinity],
        ["class instance", new Date(0)],
        ["cycle", cyclic],
        ["sparse array", Array(2)],
        ["named array property", Object.assign([1], {extra: true})],
        [
            "accessor",
            {
                get value() {
                    throw new Error("must not evaluate the getter");
                },
            },
        ],
        ["toJSON", {toJSON: () => "changed"}],
    ])("rejects %s and recovers on the next compilation", async (_label, data) => {
        const plugin = new RuntimeDataPlugin({property: "fixture", data: data as RuntimeDataPluginData});
        compiler = build([plugin]);
        await expect(run(compiler)).rejects.toThrow('RuntimeDataPlugin property "fixture" has invalid data');
        plugin.update(null);
        const recovered = await run(compiler);
        for (const file of filenames(recovered)) expect(readData(recovered, file, "fixture")).toBeNull();
    });
});
