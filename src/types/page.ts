import {ViewConfig, ViewDefinition} from "@typing/view";
import {EntrypointOptions} from "@typing/entrypoint";

export interface PageConfig extends ViewConfig {
    name?: string;
}

export type PageEntrypointOptions = PageConfig & EntrypointOptions;

export type PageProps = PageEntrypointOptions;

export type PageDefinition = PageEntrypointOptions & ViewDefinition<PageProps>;