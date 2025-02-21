import {Compiler} from 'webpack';

export type WatchPluginCallback = (files: ReadonlySet<string>) => Promise<void>;

class WatchPlugin {
    constructor(private readonly callback: WatchPluginCallback, public readonly key: string) {
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

export default WatchPlugin;
