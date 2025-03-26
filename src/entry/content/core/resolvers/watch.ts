import debounce from "debounce";

import {ContentScriptWatchStrategy} from "@typing/content";

export const contentScriptMutationObserverResolver = (
    options?: MutationObserverInit
): ContentScriptWatchStrategy => (update) => {
    if (!options) {
        options = {};
    }

    const handle = debounce(update, 200);

    const observer = new MutationObserver(handle);

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        ...options,
    });

    return () => {
        handle.clear();
        observer.disconnect();
    };
}

export const contentScriptAwaitFirstResolver = (
    options?: MutationObserverInit
): ContentScriptWatchStrategy => (update, context) => {
    const resolver = contentScriptMutationObserverResolver({
        attributes: false,
        characterData: false,
        ...options
    });

    let unwatch: { (): void } | undefined;

    const clear = () => {
        unwatch && unwatch();
        unwatch = undefined;
    };

    if (context.nodes.size === 0) {
        unwatch = resolver(() => {
            update();

            if (context.nodes.size > 0) {
                clear();
            }
        }, context);
    }

    return () => {
        clear();
    };
};

export const contentScriptLocationResolver = (
    strategy: ContentScriptWatchStrategy
): ContentScriptWatchStrategy => (update, context) => {
    let currentUrl = location.href;

    const interval = setInterval(() => {
        if (currentUrl !== location.href) {
            currentUrl = location.href;

            context.mount();
        }
    }, 300);

    const unwatch = strategy(update, context);

    return () => {
        clearInterval(interval);
        unwatch();
    };
}