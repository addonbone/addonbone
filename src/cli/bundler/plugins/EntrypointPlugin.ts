import _ from "lodash"
import path from "path";

import {Compiler, EntryNormalized} from "@rspack/core";
import VirtualModulesPlugin from 'rspack-plugin-virtual-module';

import UniqKeyPlugin from "./UniqKeyPlugin";

import {EntrypointFile} from "@typing/entrypoint";

export type EntrypointPluginEntries = Record<string, EntrypointFile[]>;

export type EntrypointPluginTemplate = (file: EntrypointFile) => string;

export type EntrypointPluginUpdate = (files: ReadonlySet<string>) => Promise<EntrypointPluginEntries>;

export interface EntrypointPluginModule {
    /**
     * Virtual module name, used in the rspack entry and virtual module.
     */
    name: string;

    /**
     * Virtual module content.
     */
    module: string;
}

export type EntrypointPluginModules = Map<EntrypointFile, EntrypointPluginModule>;

export type EntrypointPluginEntryModules = Map<string, EntrypointPluginModules>;

class EntrypointPlugin extends UniqKeyPlugin {
    private _plugin?: VirtualModulesPlugin;
    private _modules?: EntrypointPluginEntryModules;

    protected template?: EntrypointPluginTemplate;
    protected update?: EntrypointPluginUpdate;

    public static filename(file: EntrypointFile): string {
        let name = file.file;

        if (file.external) {
            const {ext} = path.parse(name);
            name = file.import + ext;
        }

        return path.join('virtual', name);
    }

    protected get plugin(): VirtualModulesPlugin {
        if (this._plugin) {
            return this._plugin;
        }

        const modules = Object.fromEntries(this.getModuleContents(this.modules));

        return this._plugin = new VirtualModulesPlugin(modules);
    }

    protected get modules(): EntrypointPluginEntryModules {
        return this._modules ??= this.createModules(this.entries);
    }

    protected get watchFiles(): ReadonlySet<string> {
        const files = Array.from(this.modules.values())
            .flatMap(modules => Array.from(modules.keys()))
            .filter(({external}) => !external)
            .map(({file}) => file);

        return new Set(files);
    }

    constructor(
        private readonly entries: EntrypointPluginEntries = {},
        key: string
    ) {
        super(key);
    }

    public virtual(template: EntrypointPluginTemplate): this {
        this.template = template;

        return this;
    }

    public watch(update: EntrypointPluginUpdate): this {
        this.update = update;

        return this;
    }

    public apply(compiler: Compiler): void {
        this.plugin.apply(compiler);

        compiler.hooks.entryOption.tap('EntrypointPlugin', (_, entry) => {
            this.hookEntryOption(entry);
        });

        if (this.update) {
            compiler.hooks.watchRun.tapAsync('EntrypointPlugin', (compiler, callback) => {
                this.hookWatchRun(compiler).then(() => callback()).catch(callback);
            });
        }
    }

    protected hookEntryOption(entry: EntryNormalized): void {
        if (_.isPlainObject(entry)) {
            this.modules.entries().forEach(([name, modules]) => {
                let currentFiles = structuredClone(entry[name] ?? []);

                if ('import' in currentFiles) {
                    currentFiles = currentFiles.import;
                }

                currentFiles.push(...Array.from(modules.values(), ({name}) => name));

                entry[name] = {
                    import: _.uniq(currentFiles)
                };
            });
        } else {
            throw new Error('EntrypointPlugin: entry is not an object');
        }
    }

    protected async hookWatchRun(compiler: Compiler): Promise<void> {
        const {modifiedFiles = new Set} = compiler;

        const watchFiles = this.watchFiles;

        const needUpdate = Array.from(modifiedFiles).some(file => {
            if (path.isAbsolute(file)) {
                file = path.relative(compiler.context, file);
            }

            return watchFiles.has(file);
        });

        if (!needUpdate) {
            return;
        }

        const updatedEntries = await this.update!(modifiedFiles);

        const updatedModules = this.createModules(updatedEntries);

        const currentContents = this.getModuleContents(this.modules);
        const updatedContents = this.getModuleContents(updatedModules);

        const removedContents = new Map(
            Array.from(currentContents).filter(([key]) => !updatedContents.has(key))
        );

        const addedContents = new Map(
            Array.from(updatedContents).filter(([key]) => !currentContents.has(key))
        );

        if (removedContents.size > 0 || addedContents.size > 0) {
            removedContents.keys().forEach(name => {
                this.plugin.writeModule(name, '');
            });

            addedContents.forEach((content, name) => {
                this.plugin.writeModule(name, content);
            });

            updatedModules.entries().forEach(([name, modules]) => {
                let entry: string[] = structuredClone(compiler.options.entry[name]);

                if ('import' in entry) {
                    entry = entry.import as string[];
                }

                entry = entry.filter(file => !removedContents.has(file));

                entry.push(...Array.from(modules.values(), ({name}) => name));

                compiler.options.entry[name] = _.uniq(entry);
            });
        }

        this._modules = updatedModules;
    }


    protected createModules(entries: EntrypointPluginEntries): EntrypointPluginEntryModules {
        const entryModules: EntrypointPluginEntryModules = new Map();

        _.forEach(entries, (files, name) => {
            const modules: EntrypointPluginModules = new Map();

            _.forEach(files, (file) => {
                modules.set(file, {
                    name: EntrypointPlugin.filename(file),
                    module: this.template ? this.template(file) : '',
                });
            });

            entryModules.set(name, modules);
        });

        return entryModules;
    }

    protected getModuleContents(modules: EntrypointPluginEntryModules): Map<string, string> {
        const content = new Map<string, string>();

        modules.values().forEach((modules) => {
            modules.forEach(({name, module}) => {
                content.set(name, module);
            });
        });

        return content;
    }
}

export default EntrypointPlugin;
