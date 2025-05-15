import path from "path";
import fs from "fs";

import TsResolver from "./TsResolver";

import {PackageName} from "@typing/app";
import {EntrypointFileExtensions} from "@typing/entrypoint";
import {toPosix} from "@cli/utils/path";

const extPattern = [...EntrypointFileExtensions]
    .map(ext => ext.replace('.', '\\.'))
    .join('|');

const extRegex = new RegExp(`\\.(${extPattern})$`, 'i');

const isValid = (filePath: string): boolean => {
    return extRegex.test(filePath);
}

const findFile = (basePath: string): string | undefined => {
    for (const ext of EntrypointFileExtensions) {
        const candidate = `${basePath}.${ext}`;

        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
}

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
        this.baseDir = toPosix(baseDir);

        return this;
    }

    public get(importPath: string): string {
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
            let resolvedLocal: string | undefined = path.resolve(this.baseDir, importPath);

            if (isValid(resolvedLocal) && fs.existsSync(resolvedLocal)) {
                return resolvedLocal;
            }

            resolvedLocal = findFile(resolvedLocal);

            if (resolvedLocal) {
                return resolvedLocal;
            }

            throw new Error(`File not found at path "${resolvedLocal}" or with available extensions`);
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
            throw new Error(`Cannot resolve "${importPath}" as a local path, alias, or npm package from "${this.baseDir}"`);
        }
    }
}