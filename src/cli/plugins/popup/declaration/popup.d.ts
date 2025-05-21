import ':package';

type Tab = chrome.tabs.Tab;

declare module ':package' {
    export type PopupAlias = string;

    export function changePopup(alias: PopupAlias, tab?: number | Tab): Promise<void>;
}