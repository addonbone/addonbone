import {
    CoreManifest,
    Manifest,
    ManifestAction,
    ManifestBackground,
    ManifestBuilder,
    ManifestCommands,
    ManifestContentScripts,
    ManifestDependencies,
    ManifestHostPermissions,
    ManifestPermissions,
    ManifestVersion
} from "@typing/manifest";
import {Browser} from "@typing/browser";
import {CommandExecuteActionName} from "@typing/command";
import {Language} from "@typing/locale";


type ManifestV3 = chrome.runtime.ManifestV3;
type ManifestPermission = chrome.runtime.ManifestPermissions;

export class ManifestError extends Error {
    public constructor(message: string) {
        super('Manifest: ' + message);
    }
}

export default abstract class<T extends CoreManifest> implements ManifestBuilder<T> {
    protected name: string = "__MSG_app_name__";
    protected shortName?: string;
    protected description?: string;
    protected version: string = "0.0.0";
    protected locale?: Language;
    protected background?: ManifestBackground;
    protected action?: ManifestAction;
    protected commands: ManifestCommands = new Set();
    protected contentScripts: ManifestContentScripts = new Set();
    protected dependencies: ManifestDependencies = new Map();
    protected permissions: ManifestPermissions = new Set();
    protected hostPermissions: ManifestHostPermissions = new Set();

    public abstract getManifestVersion(): ManifestVersion;

    protected abstract buildBackground(): Partial<T> | undefined;

    protected abstract buildAction(): Partial<T> | undefined;

    protected abstract buildHostPermissions(): Partial<T> | undefined;

    protected constructor(protected readonly browser: Browser = Browser.Chrome) {
    }

    public setName(name: string): this {
        this.name = name;

        return this;
    }

    public setShortName(shortName?: string): this {
        this.shortName = shortName;

        return this;
    }

    public setDescription(description?: string): this {
        this.description = description;

        return this;
    }

    public setVersion(version: string): this {
        this.version = version;

        return this;
    }

    public setLocale(lang?: Language): this {
        this.locale = lang;

        return this;
    }


    public setBackground(background?: ManifestBackground): this {
        this.background = background;

        return this;
    }

    public setCommands(commands?: ManifestCommands): this {
        this.commands = commands || new Set();

        return this;
    }

    public setContentScripts(contentScripts?: ManifestContentScripts): this {
        this.contentScripts = contentScripts || new Set();

        return this;
    }

    public setAction(action?: ManifestAction | true): this {
        if (action === true) {
            action = {title: this.name};
        }

        this.action = action;

        return this;
    }

    public setDependencies(dependencies: ManifestDependencies): this {
        this.dependencies = dependencies;

        return this;
    }

    public addPermission(permission: ManifestPermission): this {
        this.permissions.add(permission);

        return this;
    }

    public setPermissions(permissions: ManifestPermissions): this {
        this.permissions = permissions;

        return this;
    }

    public addHostPermission(permission: string): this {
        this.hostPermissions.add(permission);

        return this;
    }

    public setHostPermissions(permissions: ManifestHostPermissions): this {
        this.hostPermissions = permissions;

        return this;
    }

    private marge<T extends CoreManifest>(manifest: T, ...sources: Array<Partial<T> | undefined>): T {
        sources = sources.filter((source) => source !== undefined);

        if (sources.length === 0) {
            return manifest;
        }

        const result = {...manifest};

        for (const source of sources) {
            Object.assign(result, source);
        }

        return result;
    }

    public build(): T {
        let manifest: Manifest = {
            name: this.name,
            short_name: this.shortName,
            description: this.description,
            version: this.version,
            manifest_version: this.getManifestVersion(),
        };

        manifest = this.marge<Manifest>(
            manifest,
            this.buildLocale(),
            this.buildBackground(),
            this.buildCommands(),
            this.buildAction(),
            this.buildContentScripts(),
            this.buildPermissions(),
            this.buildHostPermissions(),
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
            }, {} as CoreManifest['commands']);

            return {commands};
        }
    }

    protected buildContentScripts(): Partial<CoreManifest> | undefined {
        if (this.contentScripts.size > 0) {
            const contentScripts: ManifestV3['content_scripts'] = [];

            for (const script of this.contentScripts.values()) {
                const {entry, matches, excludeMatches, allFrames, runAt, excludeGlobs, includeGlobs, world} = script;

                const dependencies = this.dependencies.get(entry);

                if (!dependencies) {
                    throw new ManifestError(`Content script entry "${entry}" not found in dependencies`);
                }

                const js = Array.from(dependencies.js);
                const css = Array.from(dependencies.css);

                if (js.length === 0 && css.length === 0) {
                    throw new ManifestError(`Content script and style entry "${entry}" not found in dependencies`);
                }

                contentScripts.push({
                    matches,
                    exclude_matches: excludeMatches,
                    js: js.length > 0 ? js : undefined,
                    css: css.length > 0 ? css : undefined,
                    all_frames: allFrames,
                    run_at: runAt,
                    exclude_globs: excludeGlobs,
                    include_globs: includeGlobs,
                    world,
                });
            }

            return {content_scripts: contentScripts};
        }
    }

    protected buildPermissions(): Partial<Manifest> | undefined {
        if (this.permissions.size > 0) {
            return {permissions: Array.from(this.permissions)};
        }
    }

    protected buildLocale(): Partial<CoreManifest> | undefined {
        if (this.locale) {
            return {default_locale: this.locale};
        }
    }

    protected hasExecuteActionCommand(): boolean {
        return this.commands.size > 0 && Array.from(this.commands)
            .some(({name}) => name === CommandExecuteActionName);
    }

    public get(): T {
        return this.build();
    }
}