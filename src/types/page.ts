import {ViewDefinition, ViewOptions} from "@typing/view";
import {CspOptions} from "@typing/csp";

/** Shared property used to write and read page aliases on the bundler runtime. */
export const PageAliasesRuntimeProperty = "__adnbnPageAliases";

/** Augmented by the generated page declarations of the consuming application. */
export interface PageAliasRegistry {}

export type PageAlias = keyof PageAliasRegistry extends never ? string : Extract<keyof PageAliasRegistry, string>;

export type PageMap = Map<PageAlias, string>;

export interface PageConfig {
    name?: string;
    matches?: string[];
}

export type PageEntrypointOptions = PageConfig & CspOptions & ViewOptions;

export type PageProps = PageEntrypointOptions;

export type PageDefinition = PageEntrypointOptions & ViewDefinition<PageProps>;
