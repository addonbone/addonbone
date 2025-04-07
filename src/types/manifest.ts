import {ContentScriptConfig} from "@typing/content";
import {BackgroundConfig} from "@typing/background";
import {CommandConfig} from "@typing/command";
import {Language} from "@typing/locale";

type ManifestCommon = chrome.runtime.Manifest;
type ManifestBase = chrome.runtime.ManifestBase;
type ManifestV3 = chrome.runtime.ManifestV3;
type ManifestV2 = chrome.runtime.ManifestV2;
type ManifestIcons = chrome.runtime.ManifestIcons;
type ManifestPermission = chrome.runtime.ManifestPermissions;


type ManifestFixed<T extends ManifestBase> = Omit<T, 'manifest_version'> & {
    manifest_version: ManifestVersion
}

interface ManifestUnstable {
    permissions?: (ManifestPermission | (string & Record<never, never>))[];
    web_accessible_resources?: string[] | chrome.runtime.ManifestV3['web_accessible_resources'];
}

export type ManifestVersion = 2 | 3;

export type ManifestMapping = {
    [Key in ManifestVersion]: Key extends 2 ? ManifestFixed<ManifestV2> : ManifestFixed<ManifestV3>;
};

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

    setBackground(background?: ManifestBackground): this;

    setCommands(commands?: ManifestCommands): this;

    setContentScripts(contentScripts?: ManifestContentScripts): this;

    setAction(action?: ManifestAction | true): this;

    setDependencies(dependencies: ManifestDependencies): this;

    addPermission(permission: ManifestPermission): this;

    setPermissions(permissions: ManifestPermissions): this;

    addHostPermission(permission: string): this;

    setHostPermissions(permissions: ManifestHostPermissions): this;

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

export interface ManifestAction {
    icon?: ManifestIcons;
    title?: string;
    popup?: string;
}

export interface ManifestDependency {
    js: Set<string>;
    css: Set<string>;
    assets: Set<string>;
}

export type ManifestDependencies = Map<Entry, ManifestDependency>;

export type ManifestPermissions = Set<ManifestPermission>;

export type ManifestHostPermissions = Set<string>;