import path from "path";
import _ from "lodash";

import AbstractAssetFinder from "./AbstractAssetFinder";
import AssetPriorityFinder from "./AssetPriorityFinder";

import AssetPluginFinder from "./AssetPluginFinder";
import {EntrypointFile} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";
import {DefaultIconGroupName} from "@typing/icon";

export interface IconName {
    group: string;
    size: number;
}

export interface IconItem {
    file: EntrypointFile;
    name: IconName;
}

export type IconItems = Map<number, IconItem>;

export type IconGroups = Map<string, IconItems>;

export default class extends AbstractAssetFinder {
    protected _plugin?: AssetPluginFinder;
    protected _icons?: IconGroups;

    protected readonly sizes: ReadonlySet<number> = new Set([
        16,
        32,
        48,
        64,
        128,
        256,
        512,
    ]);

    protected readonly priority: AssetPriorityFinder;

    public constructor(config: ReadonlyConfig) {
        super(config);

        this.priority = new AssetPriorityFinder(config, this);
    }

    protected getFiles(): Promise<Set<EntrypointFile>> {
        return this.priority.files();
    }

    protected getPlugin(): AssetPluginFinder {
        return new AssetPluginFinder(this.config, 'icon', this);
    }

    public plugin(): AssetPluginFinder {
        return this._plugin ??= this.getPlugin();
    }

    public getNames(): ReadonlySet<string> {
        return new Set([...this.sizes].map(String));
    }

    public isValidName(name: string): boolean {
        return this.parseName(name) !== undefined;
    }

    public isValidExtension(extension: string): boolean {
        return extension === 'png';
    }

    protected parseName(name: string): IconName | undefined {
        name = name.toLowerCase().trim();

        if (name.includes('.')) {
            const index = name.lastIndexOf('.');

            if (index >= 0) {
                name = name.substring(0, index);
            }
        }

        const matchSize = name.match(/(\d+)$/);

        const size = matchSize ? parseInt(matchSize[1], 10) : undefined;

        if (!size || !this.sizes.has(size)) {
            return undefined;
        }

        const groupMatch = name.match(/^([a-z]+)(?:[-_]|\d)/);

        const group = groupMatch ? groupMatch[1] : DefaultIconGroupName;

        return {group, size};
    }

    protected getName(file: EntrypointFile): IconName {
        const {name: filename} = path.parse(file.file);

        const name = this.parseName(filename);

        if (!name) {
            throw new Error(`Invalid icon name: ${file.file}`);
        }

        return name;
    }

    public getDirectory(): string {
        return this.config.icon.sourceDir || 'icons';
    }

    public canMerge(): boolean {
        return this.config.mergeIcons;
    }

    protected async getIcons(): Promise<IconGroups> {
        const files = await this.plugin().files();

        const groups = _.chain([...files])
            .map((file) => ({file, name: this.getName(file)}))
            .groupBy(({name}) => name.group)
            .mapValues((files) => {
                const items: IconItems = new Map();

                files.sort(({file: a}, {file: b}) => {
                    const priorityA = this.priority.priority(a);
                    const priorityB = this.priority.priority(b);

                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    }

                    return a.file.length - b.file.length;
                }).forEach((item) => {
                    items.set(item.name.size, item);
                });

                return items;
            }).value();

        return new Map(Object.entries(groups));
    }

    public async icons(): Promise<IconGroups> {
        return this._icons ??= await this.getIcons();
    }

    public clear(): this {
        this.plugin().clear();
        this.priority.clear();

        this._icons = undefined;

        return super.clear();
    }
}