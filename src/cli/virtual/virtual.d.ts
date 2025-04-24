declare module '*?raw' {
    const content: string;
    export default content;
}

declare module 'virtual:background-entrypoint' {
    type BackgroundDefinition = import('@typing/background').BackgroundDefinition;

    interface ModuleType extends BackgroundDefinition {
        default: BackgroundDefinition | BackgroundDefinition['main'] | undefined;
    }

    const module: ModuleType;
    export = module;
}

declare module 'virtual:command-entrypoint' {
    type CommandDefinition = import('@typing/command').CommandDefinition;

    interface ModuleType extends CommandDefinition {
        default: CommandDefinition | CommandDefinition['execute'] | undefined;
    }

    const module: ModuleType;
    export = module;
}

declare module 'virtual:content-entrypoint' {
    type ContentScriptDefinition = import('@typing/content').ContentScriptDefinition;

    interface ModuleType extends ContentScriptDefinition {
        default: ContentScriptDefinition | ContentScriptDefinition['render'] | undefined;
    }

    const module: ModuleType;
    export = module;
}

declare module 'virtual:content-framework' {
    type ContentScriptDefinition = import('@typing/content').ContentScriptDefinition;

    const module: (definition: ContentScriptDefinition) => void;
    export = module;
}

declare module 'virtual:view-entrypoint' {
    import {ViewOptions} from "@typing/view";

    type ViewDefinition = import('@typing/view').ViewDefinition<ViewOptions>;

    interface ModuleType extends ViewDefinition {
        default: ViewDefinition | ViewDefinition['render'] | undefined;
    }

    const module: ModuleType;
    export = module;
}

declare module 'virtual:view-framework' {
    import {ViewOptions} from "@typing/view";

    type ViewDefinition = import('@typing/view').ViewDefinition<ViewOptions>;

    const module: (definition: ViewDefinition) => void;
    export = module;
}