import {type FC} from "react"

import {EntrypointFile, EntrypointOptions} from "@typing/entrypoint";

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

export type ContentScriptEntrypointMap = Map<EntrypointFile, ContentScriptEntrypointOptions>;

export enum ContentScriptAppendMode {
    Last = 'last',
    First = 'first',
    Replace = 'replace',
    Before = 'before',
    After = 'after',
}
export type ContentScriptAppendHandler = (anchor: Element, ui: Element) => void;

export type ContentScriptAnchor = string | Element | null | undefined;
export type ContentScriptAnchorHandler = () => ContentScriptAnchor | Promise<ContentScriptAppendHandler>;

export interface ContentScriptRenderProps extends ContentScriptEntrypointOptions {
    anchor: Element;
}

export type ContentScriptRenderComponent = FC<ContentScriptRenderProps>;
export type ContentScriptRenderHandler = (props: ContentScriptRenderProps) => any;


export interface ContentScriptDefinition extends ContentScriptEntrypointOptions {
    anchor?: ContentScriptAnchor | ContentScriptAnchorHandler;
    append?: ContentScriptAppendMode | ContentScriptAppendHandler;
    render?: ContentScriptRenderComponent | ContentScriptRenderHandler;
}