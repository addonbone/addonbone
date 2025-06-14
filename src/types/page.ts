import {ViewDefinition, ViewOptions} from "@typing/view";

export interface PageConfig {
    name?: string;
    matches?: string[];
}

export type PageEntrypointOptions = PageConfig & ViewOptions;

export type PageProps = PageEntrypointOptions;

export type PageDefinition = PageEntrypointOptions & ViewDefinition<PageProps>;