import {ViewDefinition, ViewOptions} from "@typing/view";

export interface SidebarConfig {
    icon?: string;
    apply?: boolean;
}

export type SidebarEntrypointOptions = SidebarConfig & ViewOptions;

export type SidebarProps = SidebarEntrypointOptions;

export type SidebarDefinition = SidebarEntrypointOptions & ViewDefinition<SidebarProps>;
