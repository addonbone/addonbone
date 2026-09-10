/** @jest-environment node */

import {spawn, type ChildProcess} from "child_process";
import {readFile, readdir, rm, writeFile} from "fs/promises";
import path from "path";
import vm from "vm";
import {createIntegrationFixture} from "../../utils/fixture";
import {stop, waitFor} from "../../browser/utils/browser";

jest.setTimeout(90_000);

type Catalogue = Record<string, Record<string, string>>;

const inspect = async (directory: string) => {
    const manifest = JSON.parse(await readFile(path.join(directory, "manifest.json"), "utf8"));
    const files: string[] = manifest.background.service_worker
        ? [manifest.background.service_worker]
        : manifest.background.scripts;
    const sandbox = {readLocaleCatalogue: undefined as (() => Catalogue) | undefined};
    const context = vm.createContext(sandbox);
    for (const file of files) {
        vm.runInContext(await readFile(path.join(directory, file), "utf8"), context);
    }
    const catalogue = sandbox.readLocaleCatalogue!();
    const languages = await readdir(path.join(directory, "_locales"));
    expect(Object.keys(catalogue).sort()).toEqual(languages.sort());
    for (const lang of languages) {
        const messages = JSON.parse(await readFile(path.join(directory, "_locales", lang, "messages.json"), "utf8"));
        const flattened = Object.fromEntries(
            Object.entries(messages).map(([key, value]) => [key, (value as {message: string}).message])
        );
        expect(catalogue[lang]).toEqual(flattened);
        expect(catalogue[lang].locale).toBe(lang);
    }
    return catalogue;
};

test.each(["chrome", "firefox"])("%s build imports the catalogue and preserves the native JSON data", async browser => {
    const fixture = await createIntegrationFixture(ADNBN_TEST_ROOT, path.join(__dirname, "fixture"));
    try {
        const catalogue = await inspect(await fixture.build({browser}));
        expect(catalogue.fr).toMatchObject({
            app_title: browser === "chrome" ? "Catalogue pour Chrome" : "Catalogue de traductions",
            app_greeting: "Hello {{name}}",
            items: "{{count}} article|{{count}} articles",
            empty: "",
            literal: 'Quotes: "hello"; slash: \\; line:\nnext; dollar: $&',
        });
        expect(Object.hasOwn(catalogue.fr, "__proto__")).toBe(true);
        expect(catalogue.fr.__proto__).toBe("An ordinary translation key");
    } finally {
        await fixture.dispose();
    }
});

test("CLI watch refreshes the catalogue, JSON and declarations from the same locale edit", async () => {
    const fixture = await createIntegrationFixture(ADNBN_TEST_ROOT, path.join(__dirname, "fixture"));
    let watcher: ChildProcess | undefined;
    let output = "";
    try {
        const directory = await fixture.build();
        await rm(path.join(directory, "manifest.json"));
        watcher = spawn(process.execPath, [path.join(ADNBN_TEST_ROOT, "bin/adnbn.js"), "watch", ".", "-b", "chrome"], {
            cwd: fixture.directory,
            stdio: ["ignore", "pipe", "pipe"],
        });
        watcher.stdout?.on("data", chunk => (output += chunk));
        watcher.stderr?.on("data", chunk => (output += chunk));
        await waitFor(() => inspect(directory), 15000, "initial locale watch build");
        await writeFile(
            path.join(fixture.directory, "src/locales/en.json"),
            await readFile(path.join(__dirname, "states/en.json"))
        );
        await waitFor(
            async () => {
                const catalogue = await inspect(directory);
                expect(catalogue.fr.app_greeting).toBe("Welcome {{name}}");
                expect(catalogue.fr.newKey).toBe("Added during watch");
                expect(catalogue.fr).not.toHaveProperty("empty");
                const declarations = await readFile(path.join(fixture.directory, ".adnbn/locale.d.ts"), "utf8");
                expect(declarations).toContain('"newKey"');
                expect(declarations).not.toContain('"empty"');
                return true;
            },
            15000,
            "updated locale catalogue and JSON"
        );
    } catch (error) {
        throw new Error(`${String(error)}\n${output}`, {cause: error});
    } finally {
        if (watcher) await stop(watcher);
        await fixture.dispose();
    }
});
