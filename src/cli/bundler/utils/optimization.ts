import path from "path";
import {NormalModule, type OptimizationSplitChunksCacheGroupTestFn} from "@rspack/core";

import {PackageName} from "@typing/app";

export const isEntryModuleOrIssuer = (
    entry: string | string[]
): OptimizationSplitChunksCacheGroupTestFn => {
    if (typeof entry === "string") {
        entry = [entry];
    }

    const entryDirs = entry.flatMap(value => [
        path.join("node_modules", PackageName, "dist", "entry", value),
        path.join("addonbone", "dist", "entry", value)
    ]);

    return (module, {moduleGraph}) => {
        const nm = module as NormalModule;
        const resource = nm.resource || "";

        if (entryDirs.some(dir => resource.includes(dir))) {
            return true;
        }

        for (const connection of moduleGraph.getIncomingConnections(nm)) {
            const origin = connection.originModule as NormalModule | undefined;

            if (!origin?.resource) {
                continue;
            }

            const originRes = origin.resource;

            if (entryDirs.some(dir => originRes.includes(dir))) {
                return true;
            }
        }

        return false;
    };
};