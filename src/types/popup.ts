import {ViewDefinition, ViewOptions} from "@typing/view";

export interface PopupConfig {
    icon?: string;
    apply?: boolean;
}

export type PopupEntrypointOptions = PopupConfig & ViewOptions;

export type PopupProps = PopupEntrypointOptions;

export type PopupDefinition = PopupEntrypointOptions & ViewDefinition<PopupProps>;