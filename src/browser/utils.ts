export function safeListener<T extends (...args: any[]) => any>(listener: T): T {
    return ((...args: Parameters<T>): ReturnType<T> | void => {
        try {
            const result = listener(...args);

            if (result instanceof Promise) {
                result.catch(err => {
                    console.error('Listener async error:', err);
                });
            }

            return result;
        } catch (err) {
            console.error('Listener sync error:', err);
        }
    }) as T;
}

export function handleListener<
    T extends (...args: any[]) => void,
    A extends unknown[]
>(
    target: {
        addListener: (callback: T, ...args: A) => void;
        removeListener: (callback: T) => void;
    },
    callback: T,
    ...args: A
): () => void {
    const listener = safeListener(callback);

    target.addListener(listener, ...args);

    return () => target.removeListener(listener);
}