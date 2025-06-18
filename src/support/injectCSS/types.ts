export interface InjectCSS  {
    run: (css: string) => Promise<void>;

    file: (files: string | string[]) => Promise<void>;
}
