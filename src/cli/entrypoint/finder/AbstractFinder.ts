import {EntrypointFile, EntrypointFinder, EntrypointType} from "@typing/entrypoint";

export default abstract class implements EntrypointFinder {
    protected _files?: Set<EntrypointFile>;

    public abstract type(): EntrypointType;

    protected abstract getFiles(): Promise<Set<EntrypointFile>>;

    public clear(): this {
        this._files = undefined;

        return this;
    }

    public async files(): Promise<Set<EntrypointFile>> {
        if (this._files) {
            return this._files;
        }

        return this._files = await this.getFiles();
    }

    public async empty(): Promise<boolean> {
        return (await this.files()).size === 0;
    }

    public async exists(): Promise<boolean> {
        return !await this.empty();
    }
}