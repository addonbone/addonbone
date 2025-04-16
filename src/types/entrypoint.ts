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

export interface EntrypointBuilder {
    build(): Promise<void>;
    destroy(): Promise<void>;
}

export type EntrypointBuilderClass<T> = T extends new (arg: infer P, ...args: any[]) => any ? P : never;