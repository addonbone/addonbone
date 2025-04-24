import path from "path";
import type {OptimizationSplitChunksCacheGroupTestFn} from "@rspack/core";

import {PackageName} from "@typing/app";

export const isEntryModuleOrIssuer = (entry: string): OptimizationSplitChunksCacheGroupTestFn => (module, {moduleGraph}) => {
    const entryDirs = [
        path.join('node_modules', PackageName, 'entry', entry),
        path.join('addonbone', 'dist', 'entry', entry), // TODO: Remove this for production
    ];

    if (entryDirs.some((dir) => (module.resource || '').includes(dir))) {
        return true;
    }

    let issuer = moduleGraph.getIssuer(module);

    while (issuer) {
        if (entryDirs.some((dir) => (issuer?.resource || '').includes(dir))) {
            return true;
        }

        issuer = moduleGraph.getIssuer(issuer);
    }

    return false;
}