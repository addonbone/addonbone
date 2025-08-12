import type {Filename} from "@rspack/core";
import type {Options as HtmlOptions} from "html-rspack-tags-plugin";

import {Command, Mode} from "@typing/app";
import {Browser} from "@typing/browser";
import {ManifestIncognitoValue, ManifestVersion} from "@typing/manifest";
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
     * Browser for which the extension is being built.
     * Determines specific settings and compatibility.
     */
    browser: Browser;

    /**
     * Name of the application (extension) that will be built.
     * Used to identify a specific extension in a multi-project structure.
     * @example "my-app"
     */
    app: string;

    /**
     * Extension name for manifest.name.
     *
     * Can be either:
     * - a plain string — inserted into the manifest as-is;
     * - a localization key (for example, "@app.name") — converted to a reference to a localized message
     *   and must exist in your locale files.
     *
     * @example "@app.name"
     * @example "Awesome App"
     */
    name: undefined | string;

    /**
     * Short extension name for manifest.short_name.
     *
     * Can be either:
     * - a plain string — inserted into the manifest as-is;
     * - a localization key (for example, "@app.short_name") — converted to a reference to a localized message
     *   and must exist in your locale files.
     *
     * Note: some browsers do not support localization in the short_name field (e.g., Opera, Edge).
     * In that case, when a localization key is provided, it will be resolved to the actual string for the selected language.
     *
     * @example "@app.short_name"
     * @example "Awesome"
     */
    shortName: undefined | string;

    /**
     * Extension description for manifest.description.
     *
     * Can be either:
     * - a plain string — inserted into the manifest as-is;
     * - a localization key (for example, "@app.description") — converted to a reference to a localized message
     *   and must exist in your locale files.
     *
     * @example "@app.description"
     * @example "My awesome app description"
     */
    description: undefined | string;

    /**
     * Author for manifest.author.
     *
     * Can be either:
     * - a plain string — inserted into the manifest as-is;
     * - a function returning a string or undefined — allows computing the value at build time.
     *
     * If the value is undefined (or the function returns undefined), the field will be omitted.
     *
     * @example "ACME Corp."
     * @example () => getEnv('AUTHOR') || "Addon Bone"
     */
    author: undefined | string | (() => string | undefined);

    /**
     * The version of the extension.
     * Can be either:
     * - a valid version (e.g., "1.0.0"), or a key referencing a value from an .env file.
     * - a function that returns the version or key dynamically.
     *
     * @default "VERSION"
     */
    version: string | (() => string | undefined);

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
    minimumVersion: string | number | (() => string | number | undefined);

    /**
     * The URL for the extension's homepage
     * Can be either:
     * - a valid url or a key referencing a value from an .env file.
     * - a function that returns the url or key dynamically.
     *
     * @default HOMEPAGE
     */
    homepage: string | (() => string | undefined);

    /**
     * Used for Firefox under `browser_specific_settings.gecko.id`,
     * but only if the "storage" permission is declared.
     * Can be either:
     * - a valid email
     * - a function that returns the email
     *
     * @default EMAIL
     */
    email: string | (() => string | undefined);

    /**
     * Used to specify how this extension will behave in incognito mode
     *
     * @default "not_allowed"
     */
    incognito?: ManifestIncognitoValue | (() => ManifestIncognitoValue | undefined);

    /**
     * Extension manifest version (e.g., v2 or v3).
     * Defines the manifest structure and available APIs.
     */
    manifestVersion: ManifestVersion;

    /**
     * Default locale for the extension.
     * @example "en"
     */
    lang?: string | Language;

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
     *
     * @default "dist"
     */
    outputDir: string;

    /**
     * Directory where the application and shared directory are located.
     * Main directory with source code.
     * @example "src"
     * @path Full path: `{{inputDir}}/{{srcDir}}`
     *
     * @default "src"
     */
    sourceDir: string;

    /**
     * Directory with common modules, content scripts, and background scripts.
     * Contains code used by multiple extensions.
     * @example "shared"
     * @path Full path: `{{inputDir}}/{{srcDir}}//{{sharedDir}}`
     *
     * @default "shared"
     */
    sharedDir: string;

    /**
     * Directory where all app extensions are located.
     * These extensions can use code from the Shared directory.
     * @example "apps"
     * @path Full path: `{{inputDir}}/{{srcDir}}/{{appsDir}}`
     *
     * @default "apps"
     */
    appsDir: string;

    /**
     * Directory inside a specific extension application.
     * May contain additional structure, such as a src folder.
     * @example "src"
     * @path Full path: `{{inputDir}}/{{appsDir}}/{{appDir}}/{{appSrcDir}}`
     *
     * @default "."
     */
    appSourceDir: string;

    /**
     * Directory for output JavaScript files in outputDir.
     * All compiled JS files will be placed here.
     * @example "js"
     * @path Full path: `{{inputDir}}//{{outputDir}}/{{appDir}}/{{jsDir}}`
     *
     * @default "js"
     */
    jsDir: string;

    /**
     * Directory for output CSS files in outputDir.
     * All compiled styles will be placed here.
     * @example "css"
     * @path Full path: `{{inputDir}}/{{outputDir}}/{{appDir}}/{{cssDir}}`
     *
     * @default "css"
     */
    cssDir: string;

    /**
     * Directory for assets (images, fonts, etc.) in outputDir.
     * @example "assets"
     * @path Full path: `{{inputDir}}/{{outputDir}}/{{appDir}}/{{assetsDir}}`
     *
     * @default "assets"
     */
    assetsDir: string;

    /**
     * Directory for HTML files in outputDir.
     * @example "view"
     * @path Full path: `{{inputDir}}/{{outputDir}}/{{appDir}}/{{htmlDir}}`
     *
     * @default "."
     */
    htmlDir: string;

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
    localeDir: string;

    /**
     * Represents an HTML configuration, which can either be a single HtmlOptions object,
     * an array of HtmlOptions objects, or a function returning one of these formats.
     *
     * - HtmlOptions: A single HTML configuration object.
     * - HtmlOptions[]: An array containing multiple HTML configuration objects.
     * - { (): HtmlOptions | HtmlOptions[] }: A function that dynamically generates and
     *   returns either an HtmlOptions object or an array of HtmlOptions objects.
     */
    html: HtmlOptions | HtmlOptions[] | {(): HtmlOptions | HtmlOptions[]};

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
    };

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
    };

    /**
     * Array of plugins used when building the extension.
     * Allows extending the builder's functionality.
     */
    plugins: Plugin[];

    /**
     * Flag to enable dependency analyzer.
     * When activated, open RSDoctor during the build, which shows
     * project dependencies and their sizes.
     *
     * @default false
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
     *
     * @default false
     */
    mergeBackground: boolean;

    /**
     * Flag indicating whether to merge commands from App and Shared directories.
     * When `true`, commands from both directories will be combined.
     *
     * @default false
     */
    mergeCommands: boolean;

    /**
     * Flag indicating whether to merge content scripts from App and Shared directories.
     * When `true`, content scripts from both directories will be combined.
     *
     * @default false
     */
    mergeContentScripts: boolean;

    /**
     * Flag indicating whether to combine content scripts with identical options into one chunk.
     * When `true`, content scripts with identical settings will be compiled into a single file.
     *
     * @default true
     */
    concatContentScripts: boolean;

    /**
     * Flag indicating whether to merge styles from App and Shared directories.
     * When `true`, styles from both directories will be combined.
     *
     * @default true
     */
    mergeStyles: boolean;

    /**
     * Flag indicating whether to merge icon files from App and Shared directories.
     * When `true`, icon files from both directories will be combined.
     *
     * @default false
     */
    mergeIcons: boolean;

    /**
     * Flag indicating whether to merge localizations from App and Shared directories.
     * When `true`, localization files from both directories will be combined.
     *
     * @default true
     */
    mergeLocales: boolean;

    /**
     * Flag indicating whether to merge page files from App and Shared directories.
     * When `true`, page files from both directories will be combined.
     *
     * @default false
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
     *
     * @default false
     */
    mergeService: boolean;

    /**
     * Flag indicating whether to merge offscreen files from App and Shared directories.
     * When `true`, offscreen files from both directories will be combined.
     *
     * @default false
     */
    mergeOffscreen: boolean;

    /**
     * Path to the directory containing public assets to be copied into the build output.
     * Must be relative to the project root and cannot be "." (the project root itself).
     *
     * @default "public"
     */
    publicDir: string;

    /**
     * If true, merges the contents of the public directory with corresponding
     * directories from Shared and Apps modules during the copy process.
     *
     * @default true
     */
    mergePublic: boolean;

    /**
     * Flag indicating whether to create separate chunks for common code.
     * When `true`, common code will be extracted into separate chunks for build size optimization
     * and improved caching. This allows the browser to load common modules once
     * and reuse them across different parts of the extension.
     *
     * @default true
     */
    commonChunks: boolean;

    /**
     * Template for generating asset output file names.
     *
     * This property defines how asset files (images, fonts, etc.) will be named in the build output.
     * It uses Rspack's Filename type, which can be either a string template or a function
     * that returns a filename string.
     *
     * Supported placeholders in string templates:
     * - `[app]` - Extension name (kebab case)
     * - `[name]` - The original asset file name without extension
     * - `[ext]` - The original asset file extension (including the dot)
     * - `[hash]` - A hash of the asset content
     * - `[contenthash]` - A hash of the content only
     *
     * When used as a function, it receives pathData and assetInfo parameters
     * and should return the final filename string.
     *
     * @example
     * // String template examples:
     * "[name].[hash][ext]"
     * "[app]-[name].[contenthash:8][ext]"
     * "images/[name].[hash][ext]"
     *
     * @example
     * // Function example:
     * (pathData, assetInfo) => {
     *   const info = pathData.module.resourceResolveData;
     *   return `${info.descriptionFileData.name}.${pathData.contentHash}${info.relativePath}`;
     * }
     *
     * @see {@link https://rspack.dev/config/output#outputassetmodulefilename} Rspack asset module filename documentation
     */
    assetsFilename: Filename;

    /**
     * Template for generating JavaScript output file names.
     *
     * This property defines how JavaScript files will be named in the build output.
     * It uses Rspack's Filename type, which can be either a string template or a function
     * that returns a filename string.
     *
     * Supported placeholders in string templates:
     * - `[app]` - Extension name (kebab case)
     * - `[name]` - The name of the entry or chunk
     * - `[hash]` - A hash of the module identifier and content
     * - `[chunkhash]` - A hash of the chunk content
     * - `[contenthash]` - A hash of the content only
     *
     * When used as a function, it receives pathData and assetInfo parameters
     * and should return the final filename string.
     *
     * @example
     * // String template examples:
     * "[name].[contenthash].js"
     * "[app]-[name].[hash:8].js"
     *
     * @example
     * // Function example:
     * (pathData, assetInfo) => {
     *   return `${pathData.chunk.name}.${pathData.chunk.hash}.js`;
     * }
     *
     * @see {@link https://rspack.dev/config/output#outputfilename} Rspack filename documentation
     */
    jsFilename: Filename;

    /**
     * Template for generating CSS output file names.
     *
     * This property defines how CSS files will be named in the build output.
     * It uses Rspack's Filename type, which can be either a string template or a function
     * that returns a filename string.
     *
     * Supported placeholders in string templates:
     * - `[app]` - Extension name (kebab case)
     * - `[name]` - The name of the entry or chunk
     * - `[hash]` - A hash of the module identifier and content
     * - `[chunkhash]` - A hash of the chunk content
     * - `[contenthash]` - A hash of the content only
     *
     * When used as a function, it receives pathData and assetInfo parameters
     * and should return the final filename string.
     *
     * @example
     * // String template examples:
     * "[name].[contenthash].css"
     * "[app]-[name].[hash:8].css"
     *
     * @example
     * // Function example:
     * (pathData, assetInfo) => {
     *   return `${pathData.chunk.name}.${pathData.chunk.hash}.css`;
     * }
     *
     * @see {@link https://rspack.dev/config/output#outputfilename} Rspack filename documentation
     */
    cssFilename: Filename;

    /**
     * Template for generating scoped CSS class names.
     *
     * Supported placeholders:
     * - `[app]` – extension name (kebab case)
     * - `[name]` – file basename without extension
     * - `[local]` – original class name from your CSS
     * - `[path]` – path to the resource, relative to the build context
     * - `[folder]` – name of the folder containing the resource
     * - `[file]` – combination of `[path]` and `[name]`
     * - `[ext]` – file extension (including the dot)
     * - `[hash]` – hash based on resourcePath + exportName, uniq for app.
     *
     *
     * Note: all characters illegal in filenames (except inside `[local]`) are replaced with “-”
     *
     * @type {string}
     */
    cssIdentName: string;
}

export type OptionalConfig = Partial<Config>;
export type UserConfig = Omit<OptionalConfig, "configFile" | "command">;
export type ReadonlyConfig = Readonly<Config>;

export type UserConfigCallback = (config: ReadonlyConfig) => UserConfig;
export type ConfigDefinition = UserConfigCallback | UserConfig;
