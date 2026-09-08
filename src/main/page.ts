import {getUrl} from "@addon-core/browser";

import {PageAliasesRuntimeProperty, type PageAlias, type PageDefinition, type PageMap} from "@typing/page";

export type {PageDefinition, PageProps, PageConfig, PageAliasRegistry, PageAlias, PageMap} from "@typing/page";

export const definePage = (options: PageDefinition): PageDefinition => {
    return options;
};

declare const __webpack_require__: {[PageAliasesRuntimeProperty]?: Record<string, string>};

export const getPages = (): PageMap => {
    const pages: PageMap = new Map();

    try {
        Object.entries(__webpack_require__[PageAliasesRuntimeProperty] ?? {}).forEach(([key, value]) => {
            pages.set(key, value);
        });
    } catch (e) {
        console.error("Failed getting pages: ", e);
    }

    return pages;
};

export const getPageUrl = (alias: PageAlias): string => {
    let path = getPages().get(alias);

    if (!path) {
        console.warn(`Cannot find page: ${alias}`);

        path = alias;
    }

    return getUrl(path);
};
