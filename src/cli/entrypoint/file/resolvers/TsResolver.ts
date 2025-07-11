import path from "path";
import fs from "fs";
import ts from "typescript";
import {createMatchPath} from "tsconfig-paths";

import {EntrypointFileExtensions} from "@typing/entrypoint";
import {SystemDir} from "@typing/app";

export default class TsResolver {
    protected static readonly instances: Map<string, TsResolver> = new Map();

    protected filename!: string;

    protected config?: ts.ParsedCommandLine;

    public get matchPath(): {(path: string): string | undefined} {
        const config = this.getConfig();

        const absoluteBaseUrl = path.resolve(path.dirname(this.filename), config.options.baseUrl || ".", SystemDir);

        const match = createMatchPath(absoluteBaseUrl, config.options.paths || {});

        const extensions = [...EntrypointFileExtensions].map(ext => "." + ext);

        return (path: string): string | undefined => match(path, undefined, fs.existsSync, extensions);
    }

    public static make(filename: string = "tsconfig.json"): TsResolver {
        if (this.instances.has(filename)) {
            return this.instances.get(filename)!;
        }

        const instance = new this(filename);

        this.instances.set(filename, instance);

        return instance;
    }

    constructor(filename: string = "tsconfig.json") {
        this.setFilename(filename);
    }

    public getFilename(): string {
        return this.filename;
    }

    public setFilename(filename: string): this {
        this.filename = path.isAbsolute(filename) ? filename : path.resolve(process.cwd(), filename);

        return this;
    }

    public getConfig(): ts.ParsedCommandLine {
        if (this.config) {
            return this.config;
        }

        if (!fs.existsSync(this.filename)) {
            throw new Error(`Cannot find tsconfig.json at: ${this.filename}`);
        }

        const tsconfigRaw = ts.readConfigFile(this.filename, p => fs.readFileSync(p, "utf8"));

        const parseConfigHost: ts.ParseConfigHost = {
            fileExists: fs.existsSync,
            readFile: p => fs.readFileSync(p, "utf8"),
            readDirectory: ts.sys.readDirectory,
            useCaseSensitiveFileNames: true,
        };

        return (this.config = ts.parseJsonConfigFileContent(
            tsconfigRaw.config,
            parseConfigHost,
            path.dirname(this.filename)
        ));
    }
}
