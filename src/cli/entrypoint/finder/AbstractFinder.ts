import {EntrypointFile, EntrypointFinder, EntrypointOptions, EntrypointType} from "@typing/entrypoint";

export default abstract class<O extends EntrypointOptions> implements EntrypointFinder<O> {
    protected _files?: Set<EntrypointFile>;
    protected _options?: Map<EntrypointFile, O>;

    public abstract type(): EntrypointType;

    protected abstract getFiles(): Promise<Set<EntrypointFile>>;

    protected abstract getOptions(): Promise<Map<EntrypointFile, O>>;

    public clear(): this {
        this._files = undefined;
        this._options = undefined;

        return this;
    }

    public async files(): Promise<Set<EntrypointFile>> {
        if (this._files) {
            return this._files;
        }

        return this._files = await this.getFiles();
    }

    public async options(): Promise<Map<EntrypointFile, O>> {
        if (this._options) {
            return this._options;
        }

        return this._options = await this.getOptions();
    }

    public async empty(): Promise<boolean> {
        return (await this.files()).size === 0;
    }

    public async exists(): Promise<boolean> {
        return !await this.empty();
    }
}