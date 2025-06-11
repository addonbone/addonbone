import {ContentScriptConfig} from "@typing/content";
import {BackgroundConfig} from "@typing/background";
import {CommandConfig} from "@typing/command";
import {Language} from "@typing/locale";

type ManifestCommon = chrome.runtime.Manifest;
type ManifestBase = chrome.runtime.ManifestBase;
type ManifestPermission = chrome.runtime.ManifestPermissions;

export const ManifestMatchSchemes: ReadonlySet<string> = new Set<string>([
    'http',
    'https',
    'file',
    'ftp',
    'ws',
    'wss'
]);

export const ManifestSpecialSchemes: ReadonlySet<string> = new Set<string>([
    'chrome-extension',
    'moz-extension',
    'data',
    'blob',
    'filesystem',
    'about',
    'chrome',
    'resource'
])

type ManifestFixed<T extends ManifestBase> = Omit<T, 'manifest_version'> & {
    manifest_version: ManifestVersion
}

interface ManifestUnstable {
    permissions?: (ManifestPermission | (string & Record<never, never>))[];
    web_accessible_resources?: string[] | chrome.runtime.ManifestV3['web_accessible_resources'];
}

export type ManifestVersion = 2 | 3;

export type CoreManifest = ManifestFixed<ManifestBase>;

export type ChromeManifest = ManifestFixed<ManifestCommon>;

export type FirefoxManifest = ChromeManifest & {
    action?: chrome.runtime.ManifestV3['action'] & {
        browser_style?: boolean;
    };
    browser_action?: chrome.runtime.ManifestV2['browser_action'] & {
        browser_style?: boolean;
    };
    page_action?: chrome.runtime.ManifestV2['page_action'] & {
        browser_style?: boolean;
    };
    browser_specific_settings?: {
        gecko?: {
            id?: string;
            strict_min_version?: string;
            strict_max_version?: string;
            update_url?: string;
        };
        gecko_android?: {
            strict_min_version?: string;
            strict_max_version?: string;
        };
    }
} & ManifestUnstable;

export type SafariManifest = ChromeManifest & {
    browser_specific_settings?: {
        safari?: {
            strict_min_version?: string;
            strict_max_version?: string;
        };
    };
} & ManifestUnstable;

export type Manifest = ChromeManifest | FirefoxManifest | SafariManifest;

export interface ManifestBuilder<T extends CoreManifest = Manifest> {
    setVersion(version: string): this;

    setLocale(lang?: Language): this;

    setName(name: string): this;

    setShortName(shortName?: string): this;

    setDescription(description?: string): this;

    setIcons(icons?: ManifestIcons): this;

    setIcon(icon?: string): this; // name of an icon set for manifest.icons

    setBackground(background?: ManifestBackground): this;

    setCommands(commands?: ManifestCommands): this;

    setContentScripts(contentScripts?: ManifestContentScripts): this;

    setPopup(popup?: ManifestPopup): this;

    setSidebar(sidebar?: ManifestSidebar): this;

    setDependencies(dependencies: ManifestDependencies): this;

    addPermission(permission: ManifestPermission): this;

    setPermissions(permissions: ManifestPermissions): this;

    appendPermissions(permissions: ManifestPermissions): this;

    addHostPermission(permission: string): this;

    setHostPermissions(permissions: ManifestHostPermissions): this;

    appendHostPermissions(permissions: ManifestHostPermissions): this;

    get(): T;
}

type Entry = string;

export interface ManifestEntry {
    entry: Entry,
}

export type ManifestBackground = ManifestEntry & BackgroundConfig;

export type ManifestContentScript = ManifestEntry & ContentScriptConfig;
export type ManifestContentScripts = Set<ManifestContentScript>;

export type ManifestCommand = CommandConfig;
export type ManifestCommands = Set<ManifestCommand>;

export interface ManifestPopup {
    /**
     * Represents the group name of an icon that can be used in UI elements.
     * This property is optional and, if defined, should typically refer to a string
     * that matches the name of an icon resource available in the application or icon library.
     */
    icon?: string;
    /**
     * Represents an optional title or name or locale key that can be assigned to an entity.
     */
    title?: string;
    /**
     * Represents an optional HTML path.
     */
    path?: string;
}

export interface ManifestSidebar {
    /**
     * Represents the group name of an icon that can be used in UI elements.
     * This property is optional and, if defined, should typically refer to a string
     * that matches the name of an icon resource available in the application or icon library.
     */
    icon?: string;
    /**
     * Represents an optional title or name or locale key that can be assigned to an entity.
     */
    title?: string;
    /**
     * Represents an optional HTML path.
     */
    path?: string;
}

export interface ManifestDependency {
    js: Set<string>;
    css: Set<string>;
    assets: Set<string>;
}

export type ManifestIcon = Map<number, string>;

export type ManifestIcons = Map<string, ManifestIcon>;

export type ManifestDependencies = Map<Entry, ManifestDependency>;

export type ManifestPermissions = Set<ManifestPermission>;

export type ManifestHostPermissions = Set<string>;