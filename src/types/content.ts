import type {FC, ReactNode} from "react";
import {Optional} from "utility-types";

import {EntrypointBuilder, EntrypointOptions} from "@typing/entrypoint";
import {Awaiter, PickNonFunctionProperties} from "@typing/helpers";

type ExecutionWorld = chrome.scripting.ExecutionWorld;
type RunAt = chrome.userScripts.RunAt;

export const ContentScriptMatches = ["*://*/*"];

export interface ContentScriptConfig {
    matches?: string[];
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
     * See https://developer.chrome.com/docs/extensions/mv3/content_scripts/
     * @default "documentIdle"
     */
    runAt?: RunAt;
    /**
     * See https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#isolated_world
     */
    world?: ExecutionWorld;
    /**
     * See https://developer.chrome.com/docs/extensions/mv3/content_scripts/
     * @default false
     */
    matchAboutBlank?: boolean;
    /**
     * See https://developer.chrome.com/docs/extensions/mv3/content_scripts/
     * @default false
     */
    matchOriginAsFallback?: boolean;
    /**
     * Whether this content script requires explicit permission declaration in the extension manifest.
     * When set to true, the content script must be declared in the manifest.json permissions section
     * to be allowed to run on the specified pages.
     *
     * @see https://developer.chrome.com/docs/extensions/mv3/declare_permissions/
     *
     * @default false
     */
    declarative?: boolean;
}

export type ContentScriptOptions = ContentScriptConfig & EntrypointOptions;

export type ContentScriptEntrypointOptions = Partial<ContentScriptOptions>;

// Append
export enum ContentScriptAppend {
    Last = "last",
    First = "first",
    Replace = "replace",
    Before = "before",
    After = "after",
}

// Mount
export type ContentScriptMountFunction = (anchor: Element, container: Element) => void | (() => void);

export interface ContentScriptMount {
    mount(): void;

    unmount(): void;
}

// Props
export interface ContentScriptProps extends ContentScriptEntrypointOptions {
    anchor: Element;
}

// Anchor
export type ContentScriptAnchor = string | Element | null | undefined;
export type ContentScriptAnchorGetter = () => Awaiter<ContentScriptAnchor>;
export type ContentScriptAnchorResolver = () => Awaiter<Element[]>;

// Render
export type ContentScriptRenderReactComponent = FC<ContentScriptProps>;
export type ContentScriptRenderValue = Element | ReactNode | ContentScriptRenderReactComponent;
export type ContentScriptRenderHandler = (props: ContentScriptProps) => Awaiter<undefined | ContentScriptRenderValue>;

// Container
export type ContentScriptContainerTag = Exclude<keyof HTMLElementTagNameMap, "html" | "body">;

export type ContentScriptContainerOptions = {
    [Tag in ContentScriptContainerTag]: {
        tagName: Tag;
    } & Exclude<Optional<PickNonFunctionProperties<HTMLElementTagNameMap[Tag]>>, "id">;
}[ContentScriptContainerTag];

export type ContentScriptContainerFactory = (
    props: ContentScriptProps
) => Awaiter<Element | ContentScriptContainerTag | ContentScriptContainerOptions>;
export type ContentScriptContainerCreator = (props: ContentScriptProps) => Awaiter<Element>;

// Watch
export type ContentScriptWatchStrategy = (update: () => void, context: ContentScriptContext) => () => void;

// Context
export interface ContentScriptContext extends ContentScriptMount {
    nodes: ReadonlySet<ContentScriptNode>;
}

// Main
export type ContentScriptMainFunction = (context: ContentScriptContext, options: ContentScriptOptions) => Awaiter<void>;

// Node
export interface ContentScriptNode extends ContentScriptMount {
    anchor: Element;
    container?: Element;
}

export type ContentScriptNodeSet = Set<ContentScriptNode>;

// Definition
export interface ContentScriptDefinition extends ContentScriptEntrypointOptions {
    anchor?: ContentScriptAnchor | ContentScriptAnchorGetter;
    mount?: ContentScriptMountFunction;
    render?: ContentScriptRenderValue | ContentScriptRenderHandler;
    container?: ContentScriptContainerTag | ContentScriptContainerOptions | ContentScriptContainerFactory;
    watch?: true | ContentScriptWatchStrategy;
    main?: ContentScriptMainFunction;
}

// prettier-ignore
export interface ContentScriptResolvedDefinition extends Omit<ContentScriptDefinition, "anchor" | "mount" | "container" | "render" | "watch"> {
    anchor: ContentScriptAnchorResolver;
    mount: ContentScriptMountFunction;
    render?: ContentScriptRenderHandler;
    container: ContentScriptContainerCreator;
    watch: ContentScriptWatchStrategy;
}

export interface ContentScriptAppendDefinition extends Omit<ContentScriptDefinition, "mount"> {
    append?: ContentScriptAppend;
}

// Builder
export interface ContentScriptBuilder extends EntrypointBuilder {
    getContext(): ContentScriptContext;
}
