import fs from "fs";
import path from "path";

class TsResolverMock {
    static make(): TsResolverMock {
        return new TsResolverMock();
    }

    public get matchPath(): {(_path: string): string | undefined} {
        return () => undefined;
    }
}

class ImportResolverMock {
    private baseDir: string = process.cwd();

    constructor(_ts: TsResolverMock = TsResolverMock.make()) {}

    public setTs(_ts: TsResolverMock): this {
        return this;
    }

    public setBaseDir(baseDir: string): this {
        this.baseDir = baseDir;
        return this;
    }

    public get(importPath: string): string {
        if (importPath.startsWith(".") || importPath.startsWith("/")) {
            const abs = path.resolve(this.baseDir, importPath);

            for (const candidate of [abs, `${abs}.ts`, path.join(abs, "index.ts")]) {
                if (fs.existsSync(candidate)) return candidate;
            }

            return abs;
        }
        return importPath;
    }
}

export {TsResolverMock as default};
export {ImportResolverMock as ImportResolver};
