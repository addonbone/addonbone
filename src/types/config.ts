import {Command, Mode} from "@typing/app";
import {Browser} from "@typing/browser";
import {ManifestVersion} from "@typing/manifest";
import {Plugin} from "@typing/plugin";
import {Language} from "@typing/locale";

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
     * @example "html"
     * @path Full path: `{{inputDir}}/{{outputDir}}/{{appDir}}/{{htmlDir}}`
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
     * Locale configuration for the extension.
     */
    locale: {
        /**
         * Default locale for the extension.
         * @example "en"
         */
        lang?: string | Language;

        /**
         * Default locale key from translation files.
         * @example "app.name"
         */
        nameKey?: string;

        /**
         * Default locale key for description from translation files.
         * @example "app.description"
         */
        descriptionKey?: string;

        /**
         * Default locale key for short name from translation files.
         * @example "app.short_name"
         */
        shortNameKey?: string;
    }

    /**
     * Array of plugins used when building the extension.
     * Allows extending the builder's functionality.
     */
    plugins: Plugin[];

    /**
     * Flag to enable dependency analyzer.
     * When activated, opens  RSDoctor during build, which shows
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
     * Flag indicating whether to merge localizations from App and Shared directories.
     * When `true`, localization files from both directories will be combined.
     */
    mergeLocales: boolean;
}


export type OptionalConfig = Partial<Config>;
export type UserConfig = Omit<OptionalConfig, 'configFile' | 'command'>;
export type ReadonlyConfig = Readonly<Config>;

export type UserConfigCallback = (config: ReadonlyConfig) => UserConfig;
export type ConfigDefinition = UserConfigCallback | UserConfig;