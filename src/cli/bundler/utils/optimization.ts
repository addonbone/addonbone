import path from "path";
import {NormalModule, type OptimizationSplitChunksCacheGroupTestFn} from "@rspack/core";

import {PackageName} from "@typing/app";

export const isEntryModuleOrIssuer = (
    entry: string | string[]
): OptimizationSplitChunksCacheGroupTestFn => (
    module,
    {moduleGraph}
) => {
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

    const visited = new Set<string>();

    const checkModule = (mod: NormalModule): boolean => {
        const resource = mod.resource || '';

        if (visited.has(resource)) {
            return false;
        }

        visited.add(resource);

        if (entryDirs.some((dir) => resource.includes(dir))) {
            return true;
        }

        let issuer = moduleGraph.getIssuer(mod) as NormalModule | null;

        while (issuer) {
            if (checkModule(issuer)) {
                return true;
            }

            issuer = moduleGraph.getIssuer(issuer) as NormalModule | null;
        }

        const connections = moduleGraph.getOutgoingConnections(mod);

        for (const connection of connections) {
            if (connection.module && connection.module instanceof NormalModule) {
                if (checkModule(connection.module)) {
                    return true;
                }
            }
        }

        return false;
    };

    return checkModule(module as NormalModule);
}
