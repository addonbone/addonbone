import webpack, {Compilation, Compiler} from 'webpack';
import {ManifestBuilder, ManifestDependencies, ManifestDependenciesMap} from "@typing/manifest";

class ManifestPlugin {
    constructor(private readonly manifest: ManifestBuilder) {
    }

    apply(compiler: Compiler): void {
        compiler.hooks.compilation.tap('ManifestPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'ManifestPlugin',
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
                },
                () => {
                    const entryDependencies: ManifestDependenciesMap = new Map();

                    compilation.entrypoints.forEach((entryPoint, entryName) => {
                        const dependencies: ManifestDependencies = {
                            assets: new Set(),
                            css: new Set(),
                            js: new Set(),
                        };

                        const files = entryPoint.getFiles();

                        files.forEach(fileName => {
                            if (fileName.endsWith('.js')) {
                                dependencies.js.add(fileName);
                            } else if (fileName.endsWith('.css')) {
                                dependencies.css.add(fileName);
                            }
                        });

                        const chunks = entryPoint.chunks;

                        chunks.forEach(chunk => {
                            chunk.files.forEach(fileName => {
                                if (this.isAsset(fileName)) {
                                    dependencies.assets.add(fileName);
                                }
                            });

                            const auxiliaryFiles = chunk.auxiliaryFiles || [];
                            auxiliaryFiles.forEach(fileName => {
                                if (this.isAsset(fileName)) {
                                    dependencies.assets.add(fileName);
                                }
                            });
                        });

                        entryDependencies.set(entryName, dependencies);
                    });

                    const manifest = this.manifest.setDependencies(entryDependencies).get();
                    const json = JSON.stringify(manifest, null, 2);

                    compilation.emitAsset(
                        'manifest.json',
                        new webpack.sources.RawSource(json)
                    );
                }
            );
        });
    }

    private isAsset(file: string): boolean {
        return /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/.test(file);
    }
}

export default ManifestPlugin;
