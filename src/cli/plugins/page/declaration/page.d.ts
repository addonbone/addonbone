import ":package";

declare module ":package" {
    export type PageAlias = string;

    export function getPageUrl(alias: PageAlias): string;
}
