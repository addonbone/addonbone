/** @jest-environment node */
import {spawn, type ChildProcess} from "child_process";
import {copyFile, readFile, rm, writeFile} from "fs/promises";
import path from "path";
import vm from "vm";

import {createIntegrationFixture} from "../../utils/fixture";
import {stop, waitFor} from "../../browser/utils/browser";

jest.setTimeout(90_000);

test("content plugin delivers Relay options and refreshes names, methods and optional values in CLI watch", async () => {
    const root = path.resolve(__dirname, "../../../..");
    // Reuse the browser application: the same production configuration also exercises real Relay RPC.
    const fixture = await createIntegrationFixture(
        root,
        path.join(root, "tests/integration/browser/content/relay-styles")
    );
    let watcher: ChildProcess | undefined;
    let output = "";
    const expectedMessaging = {
        observer: {
            name: "observer",
            matches: ["http://*/*", "https://*/*"],
            runAt: "document_idle",
            isolation: {type: "none"},
            method: "messaging",
        },
    };
    const expectedScripting = {
        collector: {
            name: "collector",
            matches: ["https://example.com/*"],
            runAt: "document_idle",
            isolation: {type: "none"},
            method: "scripting",
            declarative: "required",
            allFrames: false,
        },
    };

    try {
        await rm(path.join(fixture.directory, "src/control.relay.ts"));
        await rm(path.join(fixture.directory, "src/iframe.relay.ts"));
        await copyFile(path.join(__dirname, "states/background.ts"), path.join(fixture.directory, "src/background.ts"));
        const entry = path.join(fixture.directory, "src/shadow.relay.ts");
        // Save like an editor: Windows copyFile preserves the fixture's old mtime, so watch can miss the edit.
        const setState = async (state: string) =>
            writeFile(entry, await readFile(path.join(__dirname, "states", `${state}.ts`)));
        await setState("messaging");
        const directory = await fixture.build({browser: "chrome"});
        const inspect = async () => {
            const manifest = JSON.parse(await readFile(path.join(directory, "manifest.json"), "utf8"));
            const background = manifest.background.service_worker;
            const source = await readFile(path.join(directory, background), "utf8");
            const sandbox = {readRelayOptions: undefined as undefined | (() => unknown)};
            vm.runInNewContext(source, sandbox);
            for (const script of manifest.content_scripts ?? []) expect(script.js).not.toContain(background);
            return sandbox.readRelayOptions!();
        };

        expect(await inspect()).toEqual(expectedMessaging);
        await rm(path.join(directory, "manifest.json"));
        watcher = spawn(process.execPath, [path.join(root, "bin/adnbn.js"), "watch", ".", "-b", "chrome"], {
            cwd: fixture.directory,
            stdio: ["ignore", "pipe", "pipe"],
        });
        watcher.stdout?.on("data", chunk => (output += chunk));
        watcher.stderr?.on("data", chunk => (output += chunk));
        await waitFor(inspect, 15000, "initial Relay watch build");

        for (const [state, expected] of [
            ["scripting", expectedScripting],
            ["messaging", expectedMessaging],
        ] as const) {
            await setState(state);
            await waitFor(
                async () => {
                    const options = await inspect();
                    expect(options).toEqual(expected);
                    return options;
                },
                15000,
                `CLI watch Relay state "${state}"`
            );
            const declaration = await readFile(path.join(fixture.directory, ".adnbn/relay.d.ts"), "utf8");
            const name = Object.keys(expected)[0];
            expect(declaration).toContain(name);
            expect(declaration).not.toContain(state === "scripting" ? "observer" : "collector");
        }

        await stop(watcher);
        watcher = undefined;
        await rm(entry);
        await fixture.build({browser: "chrome"});
        expect(await inspect()).toEqual({});
    } catch (error) {
        throw new Error(`${String(error)}\n${output}`, {cause: error});
    } finally {
        if (watcher) await stop(watcher);
        await fixture.dispose();
    }
});
