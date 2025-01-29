import {Chunk, Compilation, Compiler} from 'webpack';

export type DependencyMap = Map<string, string[]>;

export default class EntryDependenciesPlugin {

    private dependencyMap: DependencyMap = new Map();

    constructor(private callback?: (map: DependencyMap) => void) {

    }

    apply(compiler: Compiler): void {
        compiler.hooks.compilation.tap('EntryDependenciesPlugin', (compilation: Compilation) => {
                compilation.hooks.processAssets.tapPromise(
                    {
                        name: 'EntryDependenciesPlugin',
                        stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_HASH,
                    },
                    async () => {
                        const {entrypoints} = compilation;

                        for (const [entryName, entrypoint] of entrypoints) {
                            const chunks = new Set<Chunk>();
                            const visitedChunks = new Set<Chunk>();

                            const collectChunks = (chunk: Chunk) => {
                                if (visitedChunks.has(chunk)) return;
                                visitedChunks.add(chunk);
                                chunks.add(chunk);

                                for (const child of chunk.getAllAsyncChunks()) {
                                    collectChunks(child);
                                }
                            };

                            const entryChunk = entrypoint.getEntrypointChunk();
                            collectChunks(entryChunk);

                            const files = new Set<string>();
                            for (const chunk of chunks) {
                                for (const file of chunk.files) {
                                    files.add(file);
                                }
                            }

                            this.dependencyMap[entryName] = Array.from(files);
                        }

                        if (this.callback) {
                            this.callback(this.dependencyMap);
                        }

                        // const outputContent = JSON.stringify(
                        //     this.dependencyMap,
                        //     null,
                        //     2
                        // );
                        //
                        // compilation.emitAsset(
                        //     this.options.outputFileName!,
                        //     new compiler.webpack.sources.RawSource(outputContent)
                        // );
                    }
                );
            }
        );
    }
}