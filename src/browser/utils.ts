type Event<T extends Function> = chrome.events.Event<T>

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

export function handleListener<T extends (...args: any[]) => void>(
    target: Event<T>,
    callback: T,
): () => void {
    const listener = safeListener(callback);

    target.addListener(listener);

    return () => target.removeListener(listener);
}