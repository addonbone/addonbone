import {ViewDefinition, ViewOptions} from "@typing/view";
import {Browser} from "@typing/browser";

export const SidebarAlternativeBrowsers: ReadonlySet<Browser> = new Set([
    Browser.Opera,
    Browser.Firefox,
]);

export interface SidebarConfig {
    icon?: string;
    apply?: boolean;
}

export type SidebarEntrypointOptions = SidebarConfig & ViewOptions;

export type SidebarProps = SidebarEntrypointOptions;

export type SidebarDefinition = SidebarEntrypointOptions & ViewDefinition<SidebarProps>;
