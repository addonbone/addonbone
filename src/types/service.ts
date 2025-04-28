export type DefaultService = ((...args: any[]) => Promise<any>) | { [key: string]: any | DefaultService };

export type ProxyService<T> = {
    [K in keyof T]:
    T[K] extends (...args: any[]) => any
        ? (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>
        : T[K] extends object
            ? ProxyService<T[K]>
            : () => Promise<Awaited<T[K]>>;
};
