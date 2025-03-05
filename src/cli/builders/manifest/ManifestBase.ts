import {
    CoreManifest,
    Manifest,
    ManifestAction,
    ManifestBackground,
    ManifestBuilder,
    ManifestCommandMap,
    ManifestContentScriptMap,
    ManifestDependenciesMap,
    ManifestVersion
} from "@typing/manifest";

import {Browser} from "@typing/browser";
import {EXECUTE_ACTION_COMMAND_NAME} from "@typing/command";

export class ManifestError extends Error {
    public constructor(message: string) {
        super('Manifest: ' + message);
    }
}

export default abstract class<T extends CoreManifest> implements ManifestBuilder<T> {
    protected name: string = "__MSG_app_name__";
    protected shortName: string = "__MSG_app_short_name__";
    protected description: string = "__MSG_app_description__";
    protected version: string = "0.0.0";
    protected background?: ManifestBackground;
    protected action?: ManifestAction;
    protected commands: ManifestCommandMap = new Set();
    protected contentScripts: ManifestContentScriptMap = new Map();
    protected dependencies: ManifestDependenciesMap = new Map();

    public abstract getManifestVersion(): ManifestVersion;

    protected abstract buildBackground(): Partial<T> | undefined;

    protected abstract buildAction(): Partial<T> | undefined;

    protected abstract buildContentScripts(): Partial<T> | undefined;

    protected constructor(protected readonly browser: Browser = Browser.Chrome) {
    }

    public setName(name: string): this {
        this.name = name;

        return this;
    }

    public setShortName(shortName: string): this {
        this.shortName = shortName;

        return this;
    }

    public setDescription(description: string): this {
        this.description = description;

        return this;
    }

    public setVersion(version: string): this {
        this.version = version;

        return this;
    }

    public setBackground(background?: ManifestBackground): this {
        this.background = background;

        return this;
    }

    public setCommands(commands?: ManifestCommandMap): this {
        this.commands = commands || new Set();

        return this;
    }

    public setContentScripts(contentScripts?: ManifestContentScriptMap): this {
        this.contentScripts = contentScripts || new Map();

        return this;
    }

    public setAction(action?: ManifestAction | true): this {
        if (action === true) {
            action = {title: this.name};
        }

        this.action = action;

        return this;
    }

    public setDependencies(dependencies: ManifestDependenciesMap): this {
        this.dependencies = dependencies;

        return this;
    }

    private marge<T extends CoreManifest>(manifest: T, ...sources: Array<Partial<T> | undefined>): T {
        sources = sources.filter((source) => source !== undefined);

        if (sources.length === 0) {
            return manifest;
        }

        return Object.assign({}, manifest, ...sources);
    }

    public build(): T {
        let manifest: Manifest = {
            name: this.name,
            short_name: this.shortName,
            description: this.description,
            version: this.version,
            manifest_version: this.getManifestVersion(),
        };

        manifest = this.marge(
            manifest,
            this.buildBackground(),
            this.buildCommands(),
            this.buildAction(),
            this.buildContentScripts()
        );

        return manifest as T;
    }

    protected buildCommands(): Partial<CoreManifest> | undefined {
        if (this.commands.size > 0) {
            const commands = Array.from(this.commands).reduce((commands, command) => {
                const item = {
                    suggested_key: {
                        default: command?.defaultKey,
                        windows: command?.windowsKey,
                        mac: command?.macKey,
                        chromeos: command?.chromeosKey,
                        linux: command?.linuxKey,
                    },
                    description: command?.description || command.name,
                    global: command?.global,
                };

                return {...commands, [command.name]: item};
            }, {} as T['commands']);

            return {commands};
        }
    }

    protected hasExecuteActionCommand(): boolean {
        return this.commands.size > 0 && Array.from(this.commands)
            .some(({name}) => name === EXECUTE_ACTION_COMMAND_NAME);
    }

    public get(): T {
        return this.build();
    }
}