import {type Compiler} from '@rspack/core';
import UniqKeyPlugin from "@cli/bundler/plugins/UniqKeyPlugin";

interface ReplaceOptions {
    values: Record<string, string>;
}

class ReplacePlugin extends UniqKeyPlugin {
    private options: ReplaceOptions;

    constructor(options: ReplaceOptions, key: string) {
        super(key);

        this.options = options;
    }

    apply(compiler: Compiler): void {
        compiler.hooks.emit.tap('ReplacePlugin', (compilation) => {
            for (const filename in compilation.assets) {
                let content = compilation.assets[filename].source().toString();
                let hasChanges = false;

                for (const [search, replace] of Object.entries(this.options.values)) {
                    if (content.includes(search)) {
                        content = content.replace(new RegExp(search, 'g'), replace);
                        hasChanges = true;
                    }
                }

                if (hasChanges) {
                    const sourceMap = {
                        version: 3,
                        sources: [],
                        names: [],
                        mappings: '',
                        file: filename
                    };

                    compilation.assets[filename] = {
                        source: () => content,
                        size: () => content.length,
                        buffer: () => Buffer.from(content),
                        map: () => sourceMap,
                        sourceAndMap: () => ({source: content, map: sourceMap}),
                        updateHash: () => {
                        }
                    };
                }
            }
        });
    }
}

export default ReplacePlugin;