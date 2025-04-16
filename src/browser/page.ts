import {getUrl} from "./runtime";

export type PageAlias = string;

export type PageMap = Map<PageAlias, string>;

export const getPages = (): PageMap => {
    const pages: PageMap = new Map();

    try {
        // @ts-expect-error: Untyped virtual module
        Object.entries<string>(PAGE_ALIAS).forEach(([key, value]) => {
            pages.set(key, value);
        });
    } catch (e) {
        console.error('Error getting pages:', e);
    }

    return pages;
}

export const getPageUrl = (alias: PageAlias): string => {
    let path = getPages().get(alias);

    if (!path) {
        console.warn(`Cannot find page: ${alias}`);

        path = alias;
    }

    return getUrl(path);
}