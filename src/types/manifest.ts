import {ContentScriptConfig} from "@typing/content";
import {BackgroundConfig} from "@typing/background";

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

    resetBackground(background: ManifestBackground): this;

    pushContentScript(...contentScript: ManifestContentScript[]): this;

    get(): T;
}

export interface ManifestEntry {
    entry: string,
}

export interface ManifestEntryFile extends ManifestEntry {
    file: string,
}

export type ManifestBackground = ManifestEntryFile & BackgroundConfig;

export interface ManifestContentScript extends ManifestEntryFile, ContentScriptConfig {
    js?: string[];
    css?: string[];
}

export interface ManifestDependencies extends ManifestEntry {
    js?: string[];
    css?: string[];
    assets?: string[];
}
