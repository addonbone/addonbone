import {Browser} from "@typing/browser";

export const EntrypointFileExtensions: ReadonlySet<string> = new Set(['ts', 'tsx', 'js', 'jsx', 'vue', 'svelte']);

export enum EntrypointType {
    Background = 'background',
    Command = 'command',
    ContentScript = 'content',
    Page = 'page',
    Options = 'options',
    Popup = 'popup',
    Sidebar = 'sidebar',
    Offscreen = 'offscreen',
}

export interface EntrypointOptions {
    /**
     * List of target browsers to include this entrypoint in. Defaults to being included in all
     * builds. Cannot be used with `exclude`. You must choose one of the two options.
     *
     * @default undefined
     */
    includeBrowser?: Browser[];

    /**
     * List of target browsers to exclude this entrypoint from. Cannot be used with `include`. You
     * must choose one of the two options.
     *
     * @default undefined
     */
    excludeBrowser?: Browser[];

    /**
     * List of target apps to include this entrypoint in. Defaults to being included in all builds.
     * Cannot be used with `excludeApp`. You must choose one of the two options.
     *
     * @default undefined
     */
    excludeApp?: string[];

    /**
     * List of target apps to exclude this entrypoint from. Cannot be used with `includeApp`. You
     * must choose one of the two options.
     *
     * @default undefined
     */
    includeApp?: string[];
}

export interface EntrypointFile {
    file: string;
    import: string;
    external?: string;
}

/**
 * Dictionary of entrypoint for the build configuration.
 *
 * @key {string} - The name of the entrypoint that will be used in the bundler configuration.
 * @value {EntrypointFile[]} - Array of files that will be included in this entrypoint.
 * These files will be compiled and bundled together as part of the specified entrypoint.
 */
export type EntrypointEntries = Map<string, Set<EntrypointFile>>;

export interface EntrypointParser<O extends EntrypointOptions> {
    options(file: EntrypointFile): O;
}

export interface EntrypointFinder {
    files(): Promise<Set<EntrypointFile>>;

    empty(): Promise<boolean>;

    exists(): Promise<boolean>;

    clear(): this;
}

export interface EntrypointOptionsFinder<O extends EntrypointOptions> extends EntrypointFinder {
    type(): EntrypointType;

    options(): Promise<Map<EntrypointFile, O>>;
}


export interface EntrypointBuilder {
    build(): Promise<void>;

    destroy(): Promise<void>;
}

export type EntrypointBuilderClass<T> = T extends new (arg: infer P, ...args: any[]) => any ? P : never;