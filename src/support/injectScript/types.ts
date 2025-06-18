type Awaited<T> = chrome.scripting.Awaited<T>;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>

export interface InjectScript {
    run: <A extends any[], R extends any>(
        func: (...arg: A) => R,
        args?: A
    ) => Promise<InjectionResult<Awaited<R>>[]>;

    file: (files: string | string[]) => Promise<void>;
}
