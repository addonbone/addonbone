import {Compiler} from '@rspack/core';

import UniqKeyPlugin from "./UniqKeyPlugin";

export type WatchPluginCallback = (files: ReadonlySet<string>) => Promise<void>;

export default class WatchPlugin extends UniqKeyPlugin {
    constructor(private readonly callback: WatchPluginCallback, key: string) {
        super(key);
    }

    public apply(compiler: Compiler): void {
        compiler.hooks.watchRun.tapAsync('WatchPlugin', async (compiler, callback) => {
            try {
                const {modifiedFiles = new Set} = compiler;

                await this.callback(modifiedFiles);

                callback();
            } catch (e) {
                callback(e as Error);
            }
        });
    }
}
