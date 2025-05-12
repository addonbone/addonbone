import path from "path";
import {NormalModule, type OptimizationSplitChunksCacheGroupTestFn} from "@rspack/core";

import {PackageName} from "@typing/app";

export const isEntryModuleOrIssuer = (entry: string | string[]): OptimizationSplitChunksCacheGroupTestFn => (module, {moduleGraph}) => {
    if (typeof entry === 'string') {
        entry = [entry];
    }

    const entryDirs = entry.reduce((dirs, value) => {
        dirs.push(
            path.join('node_modules', PackageName, 'dist', 'entry', value),
            path.join('addonbone', 'dist', 'entry', value), // TODO: Remove this for production
        );

        return dirs;
    }, [] as string[]);

    const resource = (module as NormalModule).resource || '';

    if (entryDirs.some((dir) => resource.includes(dir))) {
        return true;
    }

    let issuer = moduleGraph.getIssuer(module) as NormalModule | null;

    while (issuer) {
        if (entryDirs.some((dir) => (issuer?.resource || '').includes(dir))) {
            return true;
        }

        issuer = moduleGraph.getIssuer(issuer) as NormalModule | null;
    }

    return false;
}