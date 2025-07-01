import ":package";

declare module ":package" {
    export type PopupAlias = string;

    export function changePopup(alias: PopupAlias, tab?: number | chrome.tabs.Tab): Promise<void>;
}
