import {EntrypointFile, EntrypointOptions} from "@typing/entrypoint";
import {Awaiter} from "@typing/helpers";

export interface BackgroundConfig {
    persistent?: boolean;
}

export type BackgroundOptions = BackgroundConfig & EntrypointOptions;

export type BackgroundEntrypointOptions = BackgroundOptions;

export interface BackgroundDefinition extends BackgroundEntrypointOptions {
    main?(options: BackgroundOptions): Awaiter<void>;
}

export type BackgroundEntrypointMap = Map<EntrypointFile, BackgroundDefinition>;