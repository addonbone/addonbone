import fs from "fs";
import ts from "typescript";
import path from "path";
import {createMatchPath} from "tsconfig-paths";

import {isValidEntrypointFilename} from "@cli/utils/entrypoint";

import {PackageName} from "@typing/app";
import {EntrypointFileExtensions} from "@typing/entrypoint";

interface ResolveOptions {
    tsconfigPath?: string;
    baseDir?: string;
}

const findFileWithExtensions = (basePath: string): string | undefined => {
    for (const ext of EntrypointFileExtensions) {
        const candidate = `${basePath}.${ext}`;

        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
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

    if (importPath.startsWith('.') || importPath.startsWith('/')) {
        let resolvedLocal: string | undefined = path.resolve(baseDir, importPath);

        if (isValidEntrypointFilename(resolvedLocal) && fs.existsSync(resolvedLocal)) {
            return resolvedLocal;
        }

        resolvedLocal = findFileWithExtensions(resolvedLocal);

        if (resolvedLocal) {
            return resolvedLocal;
        }

        throw new Error(`File not found at path "${resolvedLocal}" or with .ts/.tsx extensions`);
    }

    let aliased = matchPath(importPath);

    if (aliased) {
        if (isValidEntrypointFilename(aliased) && fs.existsSync(aliased)) {
            return path.resolve(aliased);
        }

        aliased = findFileWithExtensions(aliased);

        if (aliased) {
            return path.resolve(aliased);
        }
    }

    try {
        if (importPath === PackageName) {
            return importPath;
        }

        return require.resolve(importPath, {paths: [baseDir]});
    } catch {
        throw new Error(`Cannot resolve "${importPath}" as a local path, alias, or npm package from "${baseDir}"`);
    }
}