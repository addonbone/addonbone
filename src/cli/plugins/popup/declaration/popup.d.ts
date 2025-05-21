import ':package';

type Tab = chrome.tabs.Tab;

declare module ':package' {
    export type PopupAlias = string;

    export function changePopup(alias: PageAlias, tab?: number | Tab): Promise<void>;
}