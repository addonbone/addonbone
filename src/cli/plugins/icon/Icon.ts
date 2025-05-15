import path from "path";
import type {RawCopyPattern} from "@rspack/binding";

import {IconFinder, type IconItem} from "@cli/entrypoint";
import {ManifestIcon, ManifestIcons} from "@typing/manifest";
import {DefaultIconGroupName} from "@typing/icon";

export type CopyPatterns = Array<Pick<RawCopyPattern, 'from' | 'to'>>;

export type IconDefinition = Record<string, Record<number, string>>;

export default class extends IconFinder {
    protected createPathname(item: IconItem): string {
        const dir = this.config.icon.outputDir || 'icons';

        let {size, group} = item.name;

        group = group === DefaultIconGroupName ? '' : group + '-';

        return path.posix.join(dir, `${group}${size}.png`);
    }

    public async manifest(): Promise<ManifestIcons> {
        const icons = await this.icons();

        const manifest: ManifestIcons = new Map;

        for (const [group, items] of icons) {
            const collect: ManifestIcon = new Map;

            for (const [size, item] of items) {
                collect.set(size, '/' + this.createPathname(item));
            }

            manifest.set(group, collect);
        }

        return manifest;
    }

    public async copy(): Promise<CopyPatterns> {
        const icons = await this.icons();

        const patterns: CopyPatterns = [];

        for (const items of icons.values()) {
            for (const item of items.values()) {
                patterns.push({
                    from: item.file.file,
                    to: this.createPathname(item),
                });
            }
        }

        return patterns;
    }

    public async define(): Promise<IconDefinition> {
        const mapToJson = (map: Map<any, any>) => {
            return Object.fromEntries(
                Array.from(map.entries()).map(([key, value]) =>
                    [key, value instanceof Map ? mapToJson(value) : value]
                )
            );
        }

        return mapToJson(await this.manifest());
    }

    public async names(): Promise<Set<string>> {
        const files = await this.icons();

        return new Set(files.keys());
    }
}