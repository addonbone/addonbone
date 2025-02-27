import {ContentScriptConfig} from "@typing/content";
import {BackgroundConfig} from "@typing/background";
import {CommandConfig} from "@typing/command";

type ManifestCommon = chrome.runtime.Manifest;
type ManifestBase = chrome.runtime.ManifestBase;
type ManifestV3 = chrome.runtime.ManifestV3;
type ManifestV2 = chrome.runtime.ManifestV2;

type ManifestFixed<T extends ManifestBase> = Omit<T, 'manifest_version'> & {
    manifest_version: ManifestVersion
};

interface ManifestUnstable {
    permissions?: (chrome.runtime.ManifestPermissions | (string & Record<never, never>))[];
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

    setName(name: string): this;

    setShortName(shortName: string): this;

    setDescription(description: string): this;

    setBackground(background?: ManifestBackground): this;

    setCommands(commands?: ManifestCommandMap): this;

    setContentScripts(contentScripts?: ManifestContentScriptMap): this;

    setDependencies(dependencies: ManifestDependenciesMap): this;

    get(): T;
}

export interface ManifestEntry {
    entry: string,
}

export type ManifestBackground = ManifestEntry & BackgroundConfig;

export type ManifestContentScript = ManifestEntry & ContentScriptConfig;
export type ManifestContentScriptMap = Map<string, ManifestContentScript>;

export type ManifestCommand = CommandConfig;
export type ManifestCommandMap = Set<ManifestCommand>;

export interface ManifestDependencies {
    js: Set<string>;
    css: Set<string>;
    assets: Set<string>;
}

export type ManifestDependenciesMap = Map<string, ManifestDependencies>;
