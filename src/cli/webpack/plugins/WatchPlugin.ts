import {Compiler} from 'webpack';

type EntryMap = Record<string, string | string[]>;

export interface WatchPluginOptions {
    key?: string;
    entry?: EntryMap;
    callback: (files: ReadonlySet<string>) => void | EntryMap | Promise<void | EntryMap>;
}

class WatchPlugin {
    public readonly key: string;
    private entry: EntryMap;
    private readonly callback: WatchPluginOptions['callback'];

    constructor({key, entry = {}, callback}: WatchPluginOptions) {
        this.entry = entry;
        this.callback = callback;
        this.key = 'watch-plugin:' + (key || Object.keys(this.entry).join(','));
    }

    public apply(compiler: Compiler) {
        compiler.hooks.watchRun.tapAsync('WatchPlugin', async (compiler, callback) => {
            try {
                const {modifiedFiles = new Set} = compiler;

                const has = this.files.size === 0 || Array.from(modifiedFiles).some(file => this.files.has(file));

                if (has) {
                    const entry = await this.callback(modifiedFiles);

                    if (entry) {
                        for (const name in this.entry) {
                            delete compiler.options.entry[name];
                        }

                        for (const name in entry) {
                            compiler.options.entry[name] = entry[name];
                        }

                        this.entry = entry;
                    }
                }

                callback();
            } catch (e) {
                callback(e as Error);
            }
        });
    }

    protected get files(): Set<string> {
        return new Set(Object.values(this.entry).flatMap(value => Array.isArray(value) ? value : [value]));
    }
}

export default WatchPlugin;
