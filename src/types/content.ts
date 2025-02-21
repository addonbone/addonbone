import {EntrypointOptions} from "@typing/entrypoint";

type ExecutionWorld = chrome.scripting.ExecutionWorld;
type RunAt = chrome.userScripts.RunAt;

export interface ContentScriptConfig {
    matches?: string[];
    /**
     * See https://developer.chrome.com/docs/extensions/mv3/content_scripts/
     * @default "documentIdle"
     */
    runAt?: RunAt;
    /**
     * See https://developer.chrome.com/docs/extensions/mv3/content_scripts/
     * @default false
     */
    matchAboutBlank?: boolean;
    /**
     * See https://developer.chrome.com/docs/extensions/mv3/content_scripts/
     * @default []
     */
    excludeMatches?: string[];
    /**
     * See https://developer.chrome.com/docs/extensions/mv3/content_scripts/
     * @default []
     */
    includeGlobs?: string[];
    /**
     * See https://developer.chrome.com/docs/extensions/mv3/content_scripts/
     * @default []
     */
    excludeGlobs?: string[];
    /**
     * See https://developer.chrome.com/docs/extensions/mv3/content_scripts/
     * @default false
     */
    allFrames?: boolean;
    /**
     * See https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#isolated_world
     */
    world?: ExecutionWorld;
    /**
     * See https://developer.chrome.com/docs/extensions/mv3/content_scripts/
     * @default false
     */
    matchOriginAsFallback?: boolean;
}

export type ContentScriptEntrypointOptions = ContentScriptConfig & EntrypointOptions;

export type ContentScriptEntrypointMap = Map<string, ContentScriptDefinition>;

export interface ContentScriptDefinition extends ContentScriptEntrypointOptions {
    render?(): Promise<void>;
}