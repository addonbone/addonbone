import ":package";

declare module ":package" {
    export type SidebarAlias = string;

    export function changeSidebar(alias: SidebarAlias, tab?: number | chrome.tabs.Tab): Promise<void>;
}
