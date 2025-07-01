import path from "path";
import fs from "fs";

import TsResolver from "./TsResolver";

import {PackageName} from "@typing/app";
import {EntrypointFileExtensions} from "@typing/entrypoint";

const extPattern = [...EntrypointFileExtensions].map(ext => ext.replace(".", "\\.")).join("|");

const extRegex = new RegExp(`\\.(${extPattern})$`, "i");

const isValid = (filePath: string): boolean => {
    return extRegex.test(filePath);
};

const findFile = (basePath: string): string | undefined => {
    const candidates = [basePath, path.join(basePath, "index")];

    for (const ext of EntrypointFileExtensions) {
        for (const candidate of candidates) {
            const pathname = `${candidate}.${ext}`;

            if (fs.existsSync(pathname)) {
                return pathname;
            }
        }
    }
};

export default class {
    protected baseDir: string;

    constructor(protected ts: TsResolver = TsResolver.make()) {
        this.baseDir = process.cwd();
    }

    public setTs(ts: TsResolver): this {
        this.ts = ts;

        return this;
    }

    public setBaseDir(baseDir: string): this {
        this.baseDir = baseDir;

        return this;
    }

    public get(importPath: string): string {
        if (importPath.startsWith(".") || importPath.startsWith("/")) {
            let resolvedLocal: string | undefined = path.resolve(this.baseDir, importPath);

            if (isValid(resolvedLocal) && fs.existsSync(resolvedLocal)) {
                return resolvedLocal;
            }

            resolvedLocal = findFile(resolvedLocal);

            if (resolvedLocal) {
                return resolvedLocal;
            }

            return importPath;
        }

        let aliased = this.ts.matchPath(importPath);

        if (aliased) {
            if (isValid(aliased) && fs.existsSync(aliased)) {
                return path.resolve(aliased);
            }

            aliased = findFile(aliased);

            if (aliased) {
                return path.resolve(aliased);
            }
        }

        try {
            if (importPath === PackageName || importPath.startsWith(`${PackageName}/`)) {
                return importPath;
            }

            return require.resolve(importPath, {paths: [this.baseDir]});
        } catch {
            throw new Error(
                `Cannot resolve "${importPath}" as a local path, alias, or npm package from "${this.baseDir}"`
            );
        }
    }
}
