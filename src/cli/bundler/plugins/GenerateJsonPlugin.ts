import {Compilation, Compiler, sources} from '@rspack/core';

import UniqKeyPlugin from "./UniqKeyPlugin";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

interface JsonObject {
    [key: string]: JsonValue
}

type JsonArray = JsonValue[];

export type GenerateJsonPluginData = Record<string, JsonValue>;

export type GenerateJsonPluginUpdate = () => Promise<GenerateJsonPluginData>;

export default class GenerateJsonPlugin extends UniqKeyPlugin {
    private readonly pluginName: string = 'GenerateJsonPlugin';

    private update?: GenerateJsonPluginUpdate;

    constructor(protected data: GenerateJsonPluginData, key: string) {
        super(key);
    }

    public apply(compiler: Compiler): void {
        compiler.hooks.watchRun.tapPromise(this.pluginName, async () => {
            try {
                const update = this.update;

                if (update) {
                    this.data = await update();
                }
            } catch (e) {
                console.error('GenerateJsonPlugin: Error updating data', e);
            }
        });

        compiler.hooks.compilation.tap(this.pluginName, (compilation: Compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: this.pluginName,
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                },
                () => this.generateFiles(compilation)
            );
        });
    }

    public watch(update: GenerateJsonPluginUpdate): this {
        this.update = update;

        return this;
    }

    protected generateFiles(compilation: Compilation): void {
        Object.entries(this.data).forEach(([filename, jsonData]) => {
            const json = JSON.stringify(jsonData, null, 2);

            compilation.emitAsset(
                filename,
                new sources.RawSource(json)
            );
        });
    };
}
