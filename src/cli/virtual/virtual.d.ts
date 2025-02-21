declare module 'virtual:background-entrypoint' {
    type BackgroundDefinition = import('adnbn').BackgroundDefinition;

    interface ModuleType extends BackgroundDefinition {
        default: BackgroundDefinition | BackgroundDefinition['main'] | undefined;
    }

    const module: ModuleType;
    export = module;

    export as namespace virtualBackgroundEntrypoint;
}
