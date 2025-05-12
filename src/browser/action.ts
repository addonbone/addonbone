import {browser} from "./browser";
import {handleListener} from "./utils";
import {setSidebarBadgeBgColor, setSidebarBadgeText} from "./sidebar";
import {getManifest, isManifestVersion3, throwRuntimeError} from "./runtime";

type Action = typeof chrome.action;
type BrowserAction = typeof chrome.browserAction;

type ColorArray = chrome.action.ColorArray;
type TabIconDetails = chrome.action.TabIconDetails;
type UserSettings = chrome.action.UserSettings;
type Color = string | ColorArray

const action = <T = Action | BrowserAction>() => (isManifestVersion3() ? browser().action : browser().browserAction) as T;

// Methods
export const disableAction = (tabId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    action().disable(tabId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const enableAction = (tabId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    action().enable(tabId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const getBadgeBgColor = (tabId?: number): Promise<ColorArray> => new Promise<ColorArray>((resolve, reject) => {
    action().getBadgeBackgroundColor({tabId}, (result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getBadgeText = (tabId?: number): Promise<string> => new Promise<string>((resolve, reject) => {
    action().getBadgeText({tabId}, (result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getBadgeTextColor = (tabId?: number): Promise<ColorArray> => new Promise<ColorArray>((resolve, reject) => {
    action<Action>().getBadgeTextColor({tabId}, (result: ColorArray) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getActionPopup = (tabId?: number): Promise<string> => new Promise<string>((resolve, reject) => {
    action().getPopup({tabId}, (result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getActionTitle = (tabId?: number): Promise<string> => new Promise<string>((resolve, reject) => {
    action().getTitle({tabId}, (result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getActionUserSetting = (): Promise<UserSettings> => new Promise<UserSettings>((resolve, reject) => {
    action<Action>().getUserSettings((result: UserSettings) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const isActionEnabled = (tabId: number): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    action<Action>().isEnabled(tabId, (isEnabled: boolean) => {
        try {
            throwRuntimeError();

            resolve(isEnabled);
        } catch (e) {
            reject(e);
        }
    });
});

export const openActionPopup = (windowId?: number): Promise<void> => action<Action>().openPopup({windowId})

export const setBadgeBgColor = (color: Color, tabId?: number,): Promise<void> => new Promise<void>((resolve, reject) => {
    action().setBadgeBackgroundColor({color, tabId}, () => {
        try {
            throwRuntimeError();

            setSidebarBadgeBgColor({color, tabId})

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setBadgeText = (text: string | number, tabId?: number): Promise<void> => new Promise<void>((resolve, reject) => {
    action().setBadgeText({tabId, text: text.toString()}, () => {
        try {
            throwRuntimeError();

            setSidebarBadgeText({tabId, text: text.toString()})

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setBadgeTextColor = async (color: Color, tabId?: number): Promise<void> => {
    if (!isManifestVersion3()) {
        return;
    }

    return action<Action>().setBadgeTextColor({color, tabId});
};

export const setActionIcon = (details: TabIconDetails): Promise<void> => new Promise<void>((resolve, reject) => {
    action().setIcon(details, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setActionPopup = (popup: string, tabId?: number): Promise<void> => new Promise<void>((resolve, reject) => {
    action().setPopup({popup, tabId}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setActionTitle = (title: string, tabId?: number): Promise<void> => new Promise<void>((resolve, reject) => {
    action().setTitle({title, tabId}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});


// Custom Methods
export const getDefaultPopup = (): string => {
    const manifest = getManifest();

    return isManifestVersion3() ? manifest.action.default_popup : manifest.browser_action.default_popup;
}

export const clearBadgeText = (tabId?: number): Promise<void> => setBadgeText('', tabId);


// Events
export const onActionClicked = (callback: Parameters<typeof chrome.action.onClicked.addListener>[0]): () => void => {
    return handleListener(action().onClicked, callback)
}

export const onActionUserSettingsChanged = (callback: Parameters<typeof chrome.action.onUserSettingsChanged.addListener>[0]): () => void => {
    return handleListener(action<Action>().onUserSettingsChanged, callback)
}
