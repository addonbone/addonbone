import {Browser} from "@typing/config";

export enum EntrypointType {
    Background = 'background',
    Command = 'command',
    ContentScript = 'content',
    OptionsPage = 'options',
    Popup = 'popup',
    Sidebar = 'sidebar',
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
    external?: boolean;
}