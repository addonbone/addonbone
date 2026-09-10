import {randomUUID} from "crypto";
import path from "path";
import type {Compiler} from "@rspack/core";
import {RspackVirtualModulePlugin} from "rspack-plugin-virtual-module";

/** JavaScript source keyed by the module's import specifier. */
export type GenerateModulePluginModules = Record<string, string>;

/** Returns source updates for the registered modules. */
export type GenerateModulePluginUpdate = () => Promise<GenerateModulePluginModules>;

export class GenerateModulePlugin {
    private readonly pluginName = "GenerateModulePlugin";
    private update?: GenerateModulePluginUpdate;
    private files: readonly string[] = [];
    private moduleLayer?: string;

    constructor(private readonly modules: GenerateModulePluginModules) {}

    /** Use one module identity regardless of the importing entrypoint's layer. */
    public layer(name: string): this {
        this.moduleLayer = name;
        return this;
    }

    public watch(update: GenerateModulePluginUpdate, files: Iterable<string> = []): this {
        this.update = update;
        this.files = [...files];
        return this;
    }

    public apply(compiler: Compiler): void {
        const modules = {...this.modules};

        // The underlying plugin removes its entire directory on shutdown.
        const plugin = new RspackVirtualModulePlugin(modules, `generate-module-${randomUUID()}`);
        plugin.apply(compiler);

        if (this.moduleLayer !== undefined) {
            const resources = Object.keys(modules).map(name => compiler.options.resolve.alias![name] as string);
            compiler.options.module.rules.push({include: resources, layer: this.moduleLayer});
        }

        compiler.hooks.compilation.tap(this.pluginName, compilation => {
            for (const file of this.files) {
                compilation.fileDependencies.add(path.resolve(compiler.context, file));
            }
        });

        compiler.hooks.watchRun.tapPromise(this.pluginName, async () => {
            if (!this.update) return;

            for (const [name, source] of Object.entries(await this.update())) {
                if (modules[name] !== source) {
                    plugin.writeModule(name, source);
                    modules[name] = source;
                }
            }
        });
    }
}
