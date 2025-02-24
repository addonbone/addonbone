declare module 'virtual:background-entrypoint' {
    type BackgroundDefinition = import('adnbn').BackgroundDefinition;

    interface ModuleType extends BackgroundDefinition {
        default: BackgroundDefinition | BackgroundDefinition['main'] | undefined;
    }

    const module: ModuleType;
    export = module;

    export as namespace virtualBackgroundEntrypoint;
}

declare module 'virtual:command-entrypoint' {
    type CommandDefinition = import('adnbn').CommandDefinition;

    interface ModuleType extends CommandDefinition {
        default: CommandDefinition | CommandDefinition['main'] | undefined;
    }

    const module: ModuleType;
    export = module;

    export as namespace virtualCommandEntrypoint;
}