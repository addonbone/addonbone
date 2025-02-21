import fs from "fs";
import ts from "typescript";
import path from "path";
import {createMatchPath} from "tsconfig-paths";

interface ResolveOptions {
    tsconfigPath?: string;
    baseDir?: string;
}

function findFileWithExtensions(basePath: string, exts: string[]): string | null {
    for (const ext of exts) {
        const candidate = basePath + ext;
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return null;
}

export default (importPath: string, options: ResolveOptions = {}): string => {
    const {tsconfigPath = "tsconfig.json", baseDir = process.cwd()} = options;
    const configFile = path.isAbsolute(tsconfigPath) ? tsconfigPath : path.resolve(baseDir, tsconfigPath);

    if (!fs.existsSync(configFile)) {
        throw new Error(`Cannot find tsconfig.json at: ${configFile}`);
    }

    const tsconfigRaw = ts.readConfigFile(configFile, (p) => fs.readFileSync(p, "utf8"));

    const parseConfigHost: ts.ParseConfigHost = {
        fileExists: fs.existsSync,
        readFile: (p) => fs.readFileSync(p, "utf8"),
        readDirectory: ts.sys.readDirectory,
        useCaseSensitiveFileNames: true
    };

    const parsedConfig = ts.parseJsonConfigFileContent(
        tsconfigRaw.config,
        parseConfigHost,
        path.dirname(configFile)
    );

    const matchPath = createMatchPath(
        parsedConfig.options.baseUrl || ".",
        parsedConfig.options.paths || {}
    );

    if (importPath.startsWith(".") || importPath.startsWith("/")) {
        const resolvedLocal = path.resolve(baseDir, importPath);

        if (fs.existsSync(resolvedLocal)) {
            return resolvedLocal;
        }

        const candidate = resolvedLocal.endsWith(".ts") || resolvedLocal.endsWith(".tsx")
            ? resolvedLocal
            : findFileWithExtensions(resolvedLocal, [".ts", ".tsx"]);

        if (candidate && fs.existsSync(candidate)) {
            return candidate;
        }

        throw new Error(`File not found at path "${resolvedLocal}" or with .ts/.tsx extensions`);
    }

    const aliased = matchPath(importPath);

    if (aliased && fs.existsSync(aliased)) {
        return path.resolve(aliased);
    }

    if (aliased) {
        const candidate = aliased.endsWith(".ts") || aliased.endsWith(".tsx")
            ? aliased
            : findFileWithExtensions(aliased, [".ts", ".tsx"]);

        if (candidate && fs.existsSync(candidate)) {
            return path.resolve(candidate);
        }
    }

    try {
        if (importPath === 'adnbn') {
            return importPath;
        }

        return require.resolve(importPath, {paths: [baseDir]});
    } catch {
        throw new Error(`Cannot resolve "${importPath}" as a local path, alias, or npm package from "${baseDir}"`);
    }
}