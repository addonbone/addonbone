import path from "path";

import {toPosix} from "@cli/utils/path";

import {ReadonlyConfig} from "@typing/config";
import {EntrypointFile, EntrypointFinder} from "@typing/entrypoint";

export default abstract class implements EntrypointFinder {
    protected _files?: Set<EntrypointFile>;

    protected abstract getFiles(): Promise<Set<EntrypointFile>>;

    protected constructor(protected readonly config: ReadonlyConfig) {

    }

    public clear(): this {
        this._files = undefined;

        return this;
    }

    public async files(): Promise<Set<EntrypointFile>> {
        return this._files ??= await this.getFiles();
    }

    public async empty(): Promise<boolean> {
        return (await this.files()).size === 0;
    }

    public async exists(): Promise<boolean> {
        return !await this.empty();
    }

    protected file(filename: string): EntrypointFile {
        const {dir, name} = path.parse(filename);

        const result = toPosix(name === 'index' ? dir : path.join(dir, name));

        return {file: filename, import: result};
    }

    protected resolve(name: string, filename: string): EntrypointFile {
        const resolved = path.posix.join(name, filename);

        return {
            file: require.resolve(resolved, {paths: [process.cwd()]}),
            import: resolved,
            external: name,
        };
    }

    protected resolveSafely(name: string, filename: string): EntrypointFile | undefined {
        try {
            return this.resolve(name, filename);
        } catch {
            return undefined;
        }
    }
}