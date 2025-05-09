import {browser} from "./browser";
import {throwRuntimeError} from "./runtime";

import {isBrowser} from "@main/env";

import {Browser} from "@typing/browser";

type BadgeTextDetails = chrome.action.BadgeTextDetails;
type BadgeColorDetails = chrome.action.BadgeColorDetails;

type OpenOptions = chrome.sidePanel.OpenOptions;
type PanelOptions = chrome.sidePanel.PanelOptions;
type PanelBehavior = chrome.sidePanel.PanelBehavior;

const sidePanel = () => browser().sidePanel as typeof chrome.sidePanel;

// Methods
export const getSidebarOptions = (tabId?: number): Promise<PanelOptions> => new Promise<PanelOptions>((resolve, reject) => {
    sidePanel().getOptions({tabId}, (options) => {
        try {
            throwRuntimeError();

            resolve(options);
        } catch (e) {
            reject(e);
        }
    });
});

export const getSidebarBehavior = (): Promise<PanelBehavior> => new Promise<PanelBehavior>((resolve, reject) => {
    sidePanel().getPanelBehavior((behavior) => {
        try {
            throwRuntimeError();

            resolve(behavior);
        } catch (e) {
            reject(e);
        }
    });
});

export const openSidebar = (options: OpenOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    sidePanel().open(options, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setSidebarOptions = (options?: PanelOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    sidePanel().setOptions(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setSidebarBehavior = (behavior?: PanelBehavior): Promise<void> => new Promise<void>((resolve, reject) => {
    sidePanel().setPanelBehavior(behavior || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});


// Methods for Opera
export const isSidebarAvailable = (): boolean => {
    //@ts-ignore
    return isBrowser(Browser.Opera) && opr.sidebarAction
}

export const setSidebarBadgeText = (details: BadgeTextDetails): void => {
    //@ts-ignore
    isSidebarAvailable() && opr.sidebarAction.setBadgeText(details)
}

export const setSidebarBadgeBgColor = (details: BadgeColorDetails): void => {
    //@ts-ignore
    isSidebarAvailable() && opr.sidebarAction.setBadgeBackgroundColor(details)
}
