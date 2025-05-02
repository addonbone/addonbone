export type Awaiter<T> = T | Promise<T>;

export type PickNonFunctionProperties<T> = {
    [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export type DeepAsyncProxy<T> = {
    [K in keyof T]:
    T[K] extends (...args: any[]) => any
        ? (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>
        : T[K] extends object
            ? DeepAsyncProxy<T[K]>
            : () => Promise<Awaited<T[K]>>;
};

export const ProxyKey = '__proxy'