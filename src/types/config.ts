import type {Options as HtmlOptions} from "html-rspack-tags-plugin";

import {Command, Mode} from "@typing/app";
import {Browser} from "@typing/browser";
import {ManifestVersion} from "@typing/manifest";
import {Plugin} from "@typing/plugin";
import {Language} from "@typing/locale";

/**
 * Interface representing the configuration options for building an extension.
 * This configuration includes settings for directories, output locations,
 * behavior flags, and various merge configurations to define how the build
 * process handles individual components or resources.
 */
export interface Config {
    /**
     * Enables debug mode during extension building.
     * In debug mode, additional information about the build process is displayed.
     */
    debug: boolean;

    /**
     * Defines the command to be executed.
     * For example, `build`, `watch`, etc.
     */
    command: Command;

    /**
     * Build mode for the extension (e.g., `production`, `development`).
     * Affects optimization and other build parameters.
     */
    mode: Mode;

    /**
     * Name of the application (extension) that will be built.
     * Used to identify a specific extension in a multi-project structure.
     * @example "my-app"
     */
    app: string;

    /**
     * Author of the application (extension).
     */
    author: string | (() => string);

    /**
     * Browser for which the extension is being built.
     * Determines specific settings and compatibility.
     */
    browser: Browser;

    /**
     * Extension manifest version (e.g., v2 or v3).
     * Defines the manifest structure and available APIs.
     */
    manifestVersion: ManifestVersion;

    /**
     * Path to the directory with source files for building.
     * This is the base directory relative to which other paths are defined.
     * @example "addon"
     */
    inputDir: string;

    /**
     * Directory where the built extensions will be placed.
     * Final extension files will be located here.
     * @example "./dist"
     * @path Output path: `{{inputDir}}/{{outputDir}}`
     */
    outputDir: string;

    /**
     * Directory where the application and Shared directory are located.
     * Main directory with source code.
     * @example "src"
     * @path Full path: `{{inputDir}}/{{srcDir}}`
     */
    srcDir: string;

    /**
     * Directory with common modules, content scripts, and background scripts.
     * Contains code used by multiple extensions.
     * @example "shared"
     * @path Full path: `{{inputDir}}/{{srcDir}}//{{sharedDir}}`
     */
    sharedDir: string;

    /**
     * Directory where all app extensions are located.
     * These extensions can use code from the Shared directory.
     * @example "apps"
     * @path Full path: `{{inputDir}}/{{srcDir}}/{{appsDir}}`
     */
    appsDir: string;

    /**
     * Directory inside a specific extension application.
     * May contain additional structure, such as a src folder.
     * @example "src"
     * @path Full path: `{{inputDir}}/{{appsDir}}/{{appDir}}/{{appSrcDir}}`
     */
    appSrcDir: string;

    /**
     * Directory for output JavaScript files in outputDir.
     * All compiled JS files will be placed here.
     * @example "js"
     * @path Full path: `{{inputDir}}//{{outputDir}}/{{appDir}}/{{jsDir}}`
     */
    jsDir: string;

    /**
     * Directory for output CSS files in outputDir.
     * All compiled styles will be placed here.
     * @example "css"
     * @path Full path: `{{inputDir}}/{{outputDir}}/{{appDir}}/{{cssDir}}`
     */
    cssDir: string;

    /**
     * Directory for assets (images, fonts, etc.) in outputDir.
     * @example "assets"
     * @path Full path: `{{inputDir}}/{{outputDir}}/{{appDir}}/{{assetsDir}}`
     */
    assetsDir: string;

    /**
     * Directory for HTML files in outputDir.
     * @example "view"
     * @path Full path: `{{inputDir}}/{{outputDir}}/{{appDir}}/{{htmlDir}}`
     */
    htmlDir: string;

    /**
     * Represents an HTML configuration, which can either be a single HtmlOptions object,
     * an array of HtmlOptions objects, or a function returning one of these formats.
     *
     * - HtmlOptions: A single HTML configuration object.
     * - HtmlOptions[]: An array containing multiple HTML configuration objects.
     * - { (): HtmlOptions | HtmlOptions[] }: A function that dynamically generates and
     *   returns either an HtmlOptions object or an array of HtmlOptions objects.
     */
    html: HtmlOptions | HtmlOptions[] | { (): HtmlOptions | HtmlOptions[] };

    /**
     * Environment configuration for the extension.
     */
    env: {
        /**
         * Filter that determines which environment variables should be included.
         * Can be a string (interpreted as a prefix) or a function that receives
         * the variable name and returns true if it should be included.
         */
        filter?: ((value: string) => boolean) | string;

        /**
         * If true, the environment variable values will be obfuscated with simple encryption.
         * This is not secure encryption.
         *
         * @default false
         */
        crypt?: boolean;
    }

    /**
     * Icon configuration for the extension.
     */
    icon: {
        /**
         * Directory for icons and logos. Can be located in the Shared directory,
         * in the project root, or in a folder for a specific App.
         *
         * @example "icons"
         *
         * @path Full paths can be:
         *
         * - `{{inputDir}}/{{srcDir}}/{{icon.sourceDir}}`
         * - `{{inputDir}}/{{sharedDir}}/{{icon.sourceDir}}`
         * - `{{inputDir}}/{{appsDir}}/{{appDir}}/{{icon.sourceDir}}`
         */
        sourceDir?: string;

        /**
         * Directory for image files in outputDir.
         * @example "icons"
         * @path Full path: `{{inputDir}}/{{outputDir}}/{{appDir}}/{{icon.outputDir}}`
         */
        outputDir?: string;

        /**
         * Default icon group name. If not specified, the default icons set will be used.
         * @example "default"
         */
        name?: string;
    },

    /**
     * Locale configuration for the extension.
     */
    locale: {
        /**
         * Directory for localizations. Can be located in the Shared directory,
         * in the project root, or in a folder for a specific App.
         *
         * @example "locales"
         *
         * @path Full paths can be:
         *
         * - `{{inputDir}}/{{srcDir}}/{{localeDir}}`
         * - `{{inputDir}}/{{sharedDir}}/{{localeDir}}`
         * - `{{inputDir}}/{{appsDir}}/{{appDir}}/{{localeDir}}`
         */
        dir?: string;

        /**
         * Default locale for the extension.
         * @example "en"
         */
        lang?: string | Language;

        /**
         * Default locale key from translation files or a string.
         * @example "#app.name" or "Awesome App"
         */
        name?: string;

        /**
         * Default locale key for a short name from translation files or a string.
         * @example "#app.short_name" or "Awesome"
         */
        shortName?: string;

        /**
         * Default locale key for description from translation files or a string.
         * @example "#app.description" or "My awesome app description"
         */
        description?: string;
    }

    /**
     * Array of plugins used when building the extension.
     * Allows extending the builder's functionality.
     */
    plugins: Plugin[];

    /**
     * Flag to enable dependency analyzer.
     * When activated, open RSDoctor during the build, which shows
     * project dependencies and their sizes.
     */
    analyze: boolean;

    /**
     * Path to the builder configuration file.
     * @example "./adnbn.config.ts"
     */
    configFile: string;

    /**
     * Flag indicating whether to merge background scripts from App and Shared directories.
     * When `true`, background scripts from both directories will be combined into a single file.
     */
    mergeBackground: boolean;

    /**
     * Flag indicating whether to merge commands from App and Shared directories.
     * When `true`, commands from both directories will be combined.
     */
    mergeCommands: boolean;

    /**
     * Flag indicating whether to merge content scripts from App and Shared directories.
     * When `true`, content scripts from both directories will be combined.
     */
    mergeContentScripts: boolean;

    /**
     * Flag indicating whether to combine content scripts with identical options into one chunk.
     * When `true`, content scripts with identical settings will be compiled into a single file.
     */
    concatContentScripts: boolean;

    /**
     * Flag indicating whether to merge styles from App and Shared directories.
     * When `true`, styles from both directories will be combined.
     */
    mergeStyles: boolean;

    /**
     * Flag indicating whether to merge icon files from App and Shared directories.
     * When `true`, icon files from both directories will be combined.
     */
    mergeIcons: boolean;

    /**
     * Flag indicating whether to merge localizations from App and Shared directories.
     * When `true`, localization files from both directories will be combined.
     */
    mergeLocales: boolean;

    /**
     * Flag indicating whether to merge page files from App and Shared directories.
     * When `true`, page files from both directories will be combined.
     */
    mergePages: boolean;

    /**
     * Flag indicating whether to merge popup files from App and Shared directories.
     * When `true`, popup files from both directories will be combined.
     * This is useful for sharing popup components across different parts of the application.
     *
     * @default false
     */
    mergePopup: boolean;

    /**
     * Flag indicating whether multiple popup files are supported in the extension.
     * When `true`, the build process will handle and include multiple popup files in the extension.
     * This allows the extension to have different popup interfaces for different contexts or states.
     *
     * @default false
     */
    multiplePopup: boolean;

    /**
     * Flag indicating whether to merge sidebar files from App and Shared directories.
     * When `true`, sidebar files from both directories will be combined.
     * This is useful for sharing sidebar components across different parts of the application.
     *
     * @default false
     */
    mergeSidebar: boolean;

    /**
     * Flag indicating whether multiple sidebar files are supported in the extension.
     * When `true`, the build process will handle and include multiple sidebar files in the extension.
     * This allows the extension to have different sidebar interfaces for different contexts or states.
     *
     * @default false
     */
    multipleSidebar: boolean;

    /**
     * Flag indicating whether to merge relay files from App and Shared directories.
     * When `true`, relay files from both directories will be combined.
     *
     * @default false
     */
    mergeRelay: boolean;

    /**
     * Flag indicating whether to merge service files from App and Shared directories.
     * When `true`, service files from both directories will be combined.
     */
    mergeService: boolean;

    /**
     * Flag indicating whether to merge offscreen files from App and Shared directories.
     * When `true`, offscreen files from both directories will be combined.
     */
    mergeOffscreen: boolean;

    /**
     * The version of the extension.
     * Can be either:
     * - a valid version (e.g., "1.0.0"), or a key referencing a value from an .env file.
     * - a function that returns the version or key dynamically.
     *
     * @default "VERSION"
     */
    version: string | (() => string);

    /**
     * The minimum supported version of browser.
     * Used to populate fields in the manifest:
     * - `minimum_chrome_version`
     * - `browser_specific_settings.gecko.strict_min_version` for Firefox
     *
     * Can be either:
     * - a valid version, or a key referencing a value from an .env file.
     * - a function that returns the version or key dynamically.
     *
     * @default "MINIMUM_VERSION"
     */
    minimumVersion: string | number | (() => string | number);

    /**
     * The URL for the extension's homepage
     * Can be either:
     * - a valid url or a key referencing a value from an .env file.
     * - a function that returns the url or key dynamically.
     *
     * @default HOMEPAGE
     */
    homepage: string | (() => string);

    /**
     * Used for Firefox under `browser_specific_settings.gecko.id`,
     * but only if the "storage" permission is declared.
     * Can be either:
     * - a valid email
     * - a function that returns the email
     *
     * @default EMAIL
     */
    email: string | (() => string);
}


export type OptionalConfig = Partial<Config>;
export type UserConfig = Omit<OptionalConfig, 'configFile' | 'command'>;
export type ReadonlyConfig = Readonly<Config>;

export type UserConfigCallback = (config: ReadonlyConfig) => UserConfig;
export type ConfigDefinition = UserConfigCallback | UserConfig;