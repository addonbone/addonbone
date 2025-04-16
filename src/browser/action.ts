import {getManifest, isManifestVersion3, throwRuntimeError} from "./runtime";
import {browser} from "./env";

type BadgeBackgroundColorDetails = chrome.browserAction.BadgeBackgroundColorDetails;
type BadgeTextDetails = chrome.action.BadgeTextDetails;
type BrowserAction = typeof chrome.action;

const getAction = () => isManifestVersion3() ? browser().action : browser().browserAction;

export const setActionBadgeText = (tabId: number, text: string | number) => new Promise<void>((resolve, reject) => {
    const details: BadgeTextDetails = {text: text.toString(), tabId};

    getAction().setBadgeText(details, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const clearActionBadgeText = (tabId: number): Promise<void> => setActionBadgeText(tabId, '');

export const setActionBadgeBgColor = (tabId: number, color: BadgeBackgroundColorDetails['color']) => new Promise<void>((resolve, reject) => {
    const details: BadgeBackgroundColorDetails = {color, tabId};

    getAction().setBadgeBackgroundColor(details, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setActionBadgeTextColor = async (
    tabId: number,
    color: BadgeBackgroundColorDetails['color']
): Promise<void> => {
    if (!isManifestVersion3()) {
        return;
    }

    const action = getAction() as BrowserAction;

    await action.setBadgeTextColor({color, tabId});
};

export const setActionIcon = (
    tabId: number,
    icon: string | Record<string, string>
): Promise<void> => new Promise<void>((resolve, reject) => {
    getAction().setIcon({tabId, path: icon}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const getActionDefaultPopup = (): string => {
    const manifest = getManifest();

    return isManifestVersion3() ? manifest.action.default_popup : manifest.browser_action.default_popup;
}

export const onActionClicked = (callback: Parameters<typeof chrome.action.onClicked.addListener>[0]): () => void => {
    getAction().onClicked.addListener(callback);

    return () => getAction().onClicked.removeListener(callback);
}